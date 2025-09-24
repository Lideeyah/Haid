const refugeeService = require('../services/refugeeService');

/**
 * Refugee controller
 */

/**
 * @swagger
 * /api/v1/refugees:
 *   post:
 *     summary: Register a new refugee (beneficiary)
 *     description: Generates a simulated DID and QR code for the refugee
 *     tags: [Refugees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Beneficiary registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Beneficiary registered successfully"
 *                 did:
 *                   type: string
 *                   example: "did:haid:12345678-1234-4123-8123-123456789012"
 *                 qrCode:
 *                   type: string
 *                   format: data-url
 *                   example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const registerRefugee = async (req, res) => {
  try {
    const { did, qrCode } = await refugeeService.registerBeneficiary();
    res.status(201).json({
      message: 'Beneficiary registered successfully',
      did: did,
      qrCode: qrCode
    });
  } catch (error) {
    console.error('Error registering refugee:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal Server Error',
        status: 500
      }
    });
  }
};

module.exports = {
  registerRefugee
};