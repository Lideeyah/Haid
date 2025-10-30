const Event = require('../models/Event');
const User = require('../models/User');
const AidLog = require('../models/AidLog');
const axios = require('axios');

// Verify Event creation on blockchain
exports.verifyEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event || !event.hederaTx) {
      return res.status(404).json({ message: 'Event not found or not anchored' });
    }
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${process.env.HEDERA_TOPIC_ID}/messages/${event.hederaTx.sequenceNumber}`;
    let hederaData;
    try {
      const response = await axios.get(mirrorNodeUrl);
      hederaData = response.data;
    } catch (err) {
      return res.json({ verified: false, message: 'Event not found on blockchain', event: event.toObject() });
    }
    res.json({
      verified: true,
      message: 'Event verified on Hedera Testnet',
      event: {
        id: event._id,
        name: event.name,
        type: event.type,
        createdAt: event.createdAt
      },
      blockchainData: {
        consensusTimestamp: hederaData.consensus_timestamp,
        sequenceNumber: hederaData.sequence_number,
        runningHash: hederaData.running_hash,
        topicId: hederaData.topic_id,
        explorerUrl: `https://hashscan.io/testnet/topic/${hederaData.topic_id}/message/${hederaData.sequence_number}`
      }
    });
  } catch (err) { next(err); }
};

// Verify AidLog entry on blockchain
exports.verifyAidLog = async (req, res, next) => {
  try {
    const { aidLogId } = req.params;
    const aidLog = await AidLog.findById(aidLogId);
    if (!aidLog || !aidLog.hederaTx) {
      return res.status(404).json({ message: 'AidLog not found or not anchored' });
    }
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${process.env.HEDERA_TOPIC_ID}/messages/${aidLog.hederaTx.sequenceNumber}`;
    let hederaData;
    try {
      const response = await axios.get(mirrorNodeUrl);
      hederaData = response.data;
    } catch (err) {
      return res.json({ verified: false, message: 'AidLog not found on blockchain', aidLog: aidLog.toObject() });
    }
    res.json({
      verified: true,
      message: 'AidLog verified on Hedera Testnet',
      aidLog: aidLog.toObject(),
      blockchainData: {
        consensusTimestamp: hederaData.consensus_timestamp,
        sequenceNumber: hederaData.sequence_number,
        runningHash: hederaData.running_hash,
        topicId: hederaData.topic_id
      }
    });
  } catch (err) { next(err); }
};

// Verify DID issuance on blockchain
exports.verifyDID = async (req, res, next) => {
  try {
    const { did } = req.params;
    const user = await User.findOne({ did }).select('-password');
    if (!user || !user.hederaTx) {
      return res.status(404).json({ message: 'DID not found or not anchored' });
    }
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${process.env.HEDERA_TOPIC_ID}/messages/${user.hederaTx.sequenceNumber}`;
    let hederaData;
    try {
      const response = await axios.get(mirrorNodeUrl);
      hederaData = response.data;
    } catch (err) {
      return res.json({ verified: false, message: 'DID not found on blockchain', did: user.did });
    }
    res.json({
      verified: true,
      message: 'DID verified on Hedera Testnet',
      user: {
        did: user.did,
        name: user.name,
        role: user.role
      },
      blockchainData: {
        consensusTimestamp: hederaData.consensus_timestamp,
        sequenceNumber: hederaData.sequence_number,
        runningHash: hederaData.running_hash,
        topicId: hederaData.topic_id
      }
    });
  } catch (err) { next(err); }
};
