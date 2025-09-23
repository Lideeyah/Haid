const { Client, TopicMessageSubmitTransaction } = require('@hashgraph/sdk');
const config = require('../config');

/**
 * Collections service to handle aid collection with double-claim prevention
 * and Guardian logging
 */

// In-memory storage for tracking collections (refugeeDid + eventId combinations)
// In production, this would be replaced with a persistent database
const collectionRecords = new Set();

/**
 * Process an aid collection request
 * @param {string} refugeeDid - The refugee's DID
 * @param {string} eventId - The event ID
 * @returns {Object} Result of the collection attempt
 */
const processCollection = async (refugeeDid, eventId) => {
  // Validate input parameters
  if (!refugeeDid || !eventId) {
    throw new Error('Both refugeeDid and eventId are required');
  }

  // Create unique key for this collection attempt
  const collectionKey = `${refugeeDid}:${eventId}`;
  
  // Check for duplicate claim
  if (collectionRecords.has(collectionKey)) {
    return {
      success: false,
      message: 'Aid has already been collected for this refugee and event',
      error: 'DUPLICATE_CLAIM'
    };
  }

  try {
    // Submit message to Hedera Guardian topic
    const guardianResult = await submitToGuardian(refugeeDid, eventId);
    
    // Only mark as collected if Guardian submission was successful
    collectionRecords.add(collectionKey);
    
    return {
      success: true,
      message: 'Aid collection recorded successfully',
      data: {
        refugeeDid,
        eventId,
        timestamp: new Date().toISOString(),
        transactionId: guardianResult.transactionId,
        consensusTimestamp: guardianResult.consensusTimestamp
      }
    };
  } catch (error) {
    console.error('Failed to process collection:', error);
    throw new Error(`Collection processing failed: ${error.message}`);
  }
};

/**
 * Submit collection record to Hedera Guardian topic
 * @param {string} refugeeDid - The refugee's DID
 * @param {string} eventId - The event ID
 * @returns {Object} Guardian submission result
 */
const submitToGuardian = async (refugeeDid, eventId) => {
  // Check if Hedera credentials are configured
  if (!config.hedera.operatorId || !config.hedera.operatorKey) {
    console.warn('Hedera credentials not configured, using mock mode');
    // Return mock result for testing/development
    return {
      transactionId: `mock-tx-${Date.now()}`,
      consensusTimestamp: new Date().toISOString(),
      topicId: 'mock-topic-id',
      mockMode: true
    };
  }

  const client = Client.forTestnet();
  client.setOperator(
    config.hedera.operatorId,
    config.hedera.operatorKey
  );

  try {
    // Create message payload for Guardian
    const messagePayload = {
      type: 'AID_COLLECTION',
      refugeeDid,
      eventId,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    // Use a default topic ID for Guardian - in production this would be configurable
    // This is a sample topic ID format - replace with actual Guardian topic
    const topicId = config.hedera.guardianTopicId || '0.0.123456';

    // Submit message to Hedera Consensus Service
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(messagePayload));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    
    client.close();

    return {
      transactionId: response.transactionId.toString(),
      consensusTimestamp: receipt.consensusTimestamp?.toString(),
      topicId: topicId
    };
  } catch (error) {
    client.close();
    throw error;
  }
};

/**
 * Get collection status for a specific refugee and event
 * @param {string} refugeeDid - The refugee's DID
 * @param {string} eventId - The event ID
 * @returns {boolean} Whether aid has been collected
 */
const hasCollected = (refugeeDid, eventId) => {
  const collectionKey = `${refugeeDid}:${eventId}`;
  return collectionRecords.has(collectionKey);
};

/**
 * Get all collection records (for debugging/admin purposes)
 * @returns {Array} Array of collection keys
 */
const getAllCollections = () => {
  return Array.from(collectionRecords);
};

module.exports = {
  processCollection,
  hasCollected,
  getAllCollections
};