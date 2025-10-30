const User = require('../models/User');
const AidLog = require('../models/AidLog');
const { transferHbar } = require('../utils/hederaAccount');

// POST /api/donations/hbar
// Body: { recipientEmail, amount, note }
exports.donateHbar = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const { recipientEmail, amount, note } = req.body;
    if (!recipientEmail || !amount) {
      return res.status(400).json({ message: 'recipientEmail and amount are required' });
    }
    // Find donor and recipient
    const donor = await User.findById(donorId).select('+hederaPrivateKey');
    const recipient = await User.findOne({ email: recipientEmail });
    if (!donor || !recipient) {
      return res.status(404).json({ message: 'Donor or recipient not found' });
    }
    if (!donor.hederaAccountId || !donor.hederaPrivateKey) {
      return res.status(400).json({ message: 'Donor Hedera account not set up' });
    }
    if (!recipient.hederaAccountId) {
      return res.status(400).json({ message: 'Recipient Hedera account not set up' });
    }
    // Transfer HBAR
    const txResult = await transferHbar({
      senderAccountId: donor.hederaAccountId,
      senderPrivateKey: donor.hederaPrivateKey,
      recipientAccountId: recipient.hederaAccountId,
      amount,
    });
    // Log donation
    const log = await AidLog.create({
      donor: donor._id,
      recipient: recipient._id,
      amount,
      txId: txResult.transactionId,
      note,
      type: 'hbar',
      status: txResult.status,
    });
    res.json({ message: 'Donation successful', txResult, log });
  } catch (err) {
    next(err);
  }
};
