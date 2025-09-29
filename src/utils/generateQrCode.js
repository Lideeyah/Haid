// src/utils/generateQrCode.js
const QRCode = require('qrcode');

async function generateQrCode(data) {
  try {
    // Returns a data URL (base64 PNG)
    return await QRCode.toDataURL(data);
  } catch (err) {
    throw new Error('QR code generation failed');
  }
}

module.exports = generateQrCode;
