// src/controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    let did, qrCodeUrl, hederaTx;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Generate UUID for user before Hedera submission
    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();

    // Generate anchored DID first, with userId
    let didResult;
    try {
      didResult = await generateAnchoredDID(userId, role);
      did = didResult.did;
      if (didResult.hederaTx) {
        hederaTx = {
          status: didResult.hederaTx.status,
          transactionId: didResult.hederaTx.transactionId,
          sequenceNumber: Number(didResult.hederaTx.sequenceNumber),
          runningHash: didResult.hederaTx.runningHash,
        };
      } else {
        hederaTx = null;
      }
    } catch (hcsErr) {
      return res.status(500).json({ message: "Failed to anchor DID on blockchain." });
    }

    // Only create user in DB if Hedera succeeded, using the same UUID
    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        role,
        password: hashedPassword,
        did
      }
    });

    if (role === 'beneficiary') {
      qrCodeUrl = await generateQrCode(did);
      await prisma.user.update({
        where: { id: user.id },
        data: { qrCodeUrl }
      });
      return res.status(201).json({ beneficiaryDid: did, qrCodeUrl, hederaTx });
    }
    res.status(201).json({ message: 'User registered', user: { ...user, did }, hederaTx });
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Set token in HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// Logout controller
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
};