const refugeeService = require('../services/refugeeService');

/**
 * Refugee controller for DID generation and onboarding
 */

/**
 * Generate a new DID for refugee onboarding
 * POST /refugees
 */
const createRefugeeDID = async (req, res) => {
  try {
    const didData = await refugeeService.generateDID();
    
    res.status(201).json({
      success: true,
      message: 'Refugee DID generated successfully',
      data: {
        did: didData.did,
        publicKey: didData.publicKey,
        network: didData.network,
        qrCodeData: didData.qrCodeData,
        timestamp: didData.timestamp
      }
    });
  } catch (error) {
    console.error('Error creating refugee DID:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate refugee DID',
        details: error.message,
        status: 500
      }
    });
  }
};

module.exports = {
  createRefugeeDID
};