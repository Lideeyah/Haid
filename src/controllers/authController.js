// src/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAnchoredDID } = require('../utils/did');
const generateQrCode = require('../utils/generateQrCode');
const { validationResult } = require('express-validator');

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, password, role } = req.body;
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  let did, qrCodeUrl, hederaTx, didPublicKey, didPrivateKey, didHederaTx;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Generate UUID for user before Hedera submission
    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();


    // Generate anchored DID first, with userId
    let didResult;
    try {
      didResult = await generateAnchoredDID(userId, role);
      did = didResult.did;
      didPublicKey = didResult.publicKey;
      didPrivateKey = didResult.privateKey;
      if (didResult.hederaTx) {
        hederaTx = {
          status: didResult.hederaTx.status,
          transactionId: didResult.hederaTx.transactionId,
          sequenceNumber: Number(didResult.hederaTx.sequenceNumber),
          runningHash: didResult.hederaTx.runningHash,
        };
        didHederaTx = hederaTx;
      } else {
        hederaTx = null;
        didHederaTx = null;
      }
    } catch (hcsErr) {
      return res.status(500).json({ message: "Failed to anchor DID on blockchain." });
    }

    // Only create user in DB if Hedera succeeded, using the same UUID
    const user = new User({
      name,
      email,
      role,
      password: hashedPassword,
      did,
      hederaTx,
      didPublicKey,
      didPrivateKey,
      didHederaTx,
      createdAt: new Date()
    });
    await user.save();

    if (role === 'beneficiary') {
      qrCodeUrl = await generateQrCode(did);
      user.qrCodeUrl = qrCodeUrl;
      await user.save();
      // Do not expose private key in API response
      return res.status(201).json({ beneficiaryDid: did, qrCodeUrl, hederaTx, didPublicKey, didHederaTx });
    }
    await user.save();
    // Do not expose private key in API response
    res.status(201).json({ message: 'User registered', user: { ...user.toObject(), did, didPublicKey, didHederaTx }, hederaTx });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
  const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Return token in response body for frontend to store in localStorage
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// Logout controller
exports.logout = (req, res) => {
  // No cookie to clear, just respond
  res.json({ message: 'Logged out successfully' });
};

// Get current authenticated user profile
exports.getMe = async (req, res) => {
  // req.user should be set by authMiddleware after JWT verification
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({ user: req.user });
};