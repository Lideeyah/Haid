const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// In-memory store for registered refugees (for MVP)
const registeredRefugees = [];

/**
 * Refugee service for DID generation and management
 */

/**
 * Register a new beneficiary, generate a simulated DID and QR code.
 * @returns {Object} Contains the generated DID and QR code (data URL).
 */
const registerBeneficiary = async () => {
  try {
    const uniqueId = uuidv4();
    const did = `did:haid:${uniqueId}`; // Simulated DID

    const qrCodeDataURL = await QRCode.toDataURL(did);

    const newBeneficiary = {
      id: uniqueId,
      did: did,
      qrCode: qrCodeDataURL,
      registeredAt: new Date().toISOString()
    };

    registeredRefugees.push(newBeneficiary);

    return {
      did: newBeneficiary.did,
      qrCode: newBeneficiary.qrCode
    };

  } catch (error) {
    console.error('Error registering beneficiary:', error);
    throw new Error('Failed to register beneficiary: ' + error.message);
  }
};

/**
 * Validate simulated DID format
 * @param {string} did - The DID to validate
 * @returns {boolean} Whether the DID is valid
 */
const validateDID = (did) => {
  const didPattern = /^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return didPattern.test(did);
};

/**
 * Find a beneficiary by DID
 * @param {string} did - The DID to search for
 * @returns {Object|undefined} The beneficiary object if found, otherwise undefined.
 */
const findBeneficiaryByDID = (did) => {
  return registeredRefugees.find(b => b.did === did);
};

module.exports = {
  registerBeneficiary,
  validateDID,
  findBeneficiaryByDID,
  // Expose for testing/inspection in MVP
  _getRegisteredRefugees: () => registeredRefugees
};