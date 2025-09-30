// Hedera Consensus Service utility functions
const {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  PrivateKey,
} = require("@hashgraph/sdk");
require("dotenv").config();

// Load operator ID and key
const operatorId = process.env.OPERATOR_ID;
const operatorKeyHex = process.env.OPERATOR_KEY;

// Convert HEX-encoded ECDSA private key from dashboard into SDK key
const operatorKey = PrivateKey.fromStringECDSA(operatorKeyHex);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Create a new topic (public, no admin/submit key for hackathon simplicity)
async function createTopic(memo = "Haid Consensus Topic") {
  const transaction = new TopicCreateTransaction().setTopicMemo(memo);
  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  return receipt.topicId.toString();
}

// Submit a message to a topic
async function submitMessage(topicId, message) {
  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(message));
  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  return {
    status: receipt.status.toString(),
    transactionId: txResponse.transactionId.toString(),
    sequenceNumber: receipt.topicSequenceNumber,
    runningHash: receipt.topicRunningHash.toString("hex"),
  };
}

module.exports = {
  createTopic,
  submitMessage,
};
