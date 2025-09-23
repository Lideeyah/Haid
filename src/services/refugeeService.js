const { Client, PrivateKey, PublicKey } = require('@hashgraph/sdk');
const config = require('../config');

/**
 * Refugee service for DID generation and management
 */

/**
 * Generate a new Hedera DID for a refugee
 * @returns {Object} DID data and QR code information
 */
const generateDID = async () => {
  try {
    // Generate a new key pair for the refugee
    const privateKey = PrivateKey.generateECDSA();
    const publicKey = privateKey.publicKey;
    
    // Create a simple DID identifier using the public key
    // Format: did:hedera:testnet:{publicKey}
    const did = `did:hedera:${config.hedera.network}:${publicKey.toStringRaw()}`;
    
    // Prepare QR code data - this will contain the DID and basic info
    const qrCodeData = {
      did: did,
      publicKey: publicKey.toStringRaw(),
      network: config.hedera.network,
      timestamp: new Date().toISOString(),
      type: 'refugee_identity'
    };
    
    return {
      did: did,
      publicKey: publicKey.toStringRaw(),
      privateKey: privateKey.toStringRaw(), // In real implementation, this should be securely stored
      network: config.hedera.network,
      qrCodeData: JSON.stringify(qrCodeData),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error generating DID:', error);
    throw new Error('Failed to generate DID: ' + error.message);
  }
};

/**
 * Validate DID format
 * @param {string} did - The DID to validate
 * @returns {boolean} Whether the DID is valid
 */
const validateDID = (did) => {
  const didPattern = /^did:hedera:(testnet|mainnet):[a-fA-F0-9]{64}$/;
  return didPattern.test(did);
};

module.exports = {
  generateDID,
  validateDID
};