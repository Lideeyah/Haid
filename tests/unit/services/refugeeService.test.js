const refugeeService = require('../../../src/services/refugeeService');

describe('RefugeeService', () => {
  describe('registerBeneficiary', () => {
    it('should register a beneficiary successfully', async () => {
      const result = await refugeeService.registerBeneficiary();
      
      expect(result).toBeDefined();
      expect(result.did).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(typeof result.did).toBe('string');
      expect(typeof result.qrCode).toBe('string');
    });

    it('should generate valid DID format', async () => {
      const result = await refugeeService.registerBeneficiary();
      
      expect(result.did).toMatch(/^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique DIDs', async () => {
      const result1 = await refugeeService.registerBeneficiary();
      const result2 = await refugeeService.registerBeneficiary();
      
      expect(result1.did).not.toBe(result2.did);
    });

    it('should generate valid QR code', async () => {
      const result = await refugeeService.registerBeneficiary();
      
      expect(result.qrCode).toMatch(/^data:image\/png;base64,/);
      
      // Verify QR code contains the DID
      const qrCodeData = result.qrCode.split(',')[1];
      const decodedData = Buffer.from(qrCodeData, 'base64').toString();
      expect(decodedData).toBe(result.did);
    });

    it('should store beneficiary in memory', async () => {
      const initialCount = refugeeService._getRegisteredRefugees().length;
      await refugeeService.registerBeneficiary();
      const finalCount = refugeeService._getRegisteredRefugees().length;
      
      expect(finalCount).toBe(initialCount + 1);
    });
  });

  describe('validateDID', () => {
    it('should validate correct DID format', () => {
      const validDIDs = [
        'did:haid:12345678-1234-4123-8123-123456789012',
        'did:haid:87654321-4321-1234-1234-210987654321',
        'did:haid:abcdef12-3456-4567-8901-234567890123'
      ];

      validDIDs.forEach(did => {
        expect(refugeeService.validateDID(did)).toBe(true);
      });
    });

    it('should reject invalid DID format', () => {
      const invalidDIDs = [
        'did:haid:invalid',
        'did:other:12345678-1234-4123-8123-123456789012',
        'not-a-did',
        '',
        null,
        undefined,
        'did:haid:12345678-1234-3123-8123-123456789012', // Invalid version
        'did:haid:12345678-1234-4123-7123-123456789012'  // Invalid variant
      ];

      invalidDIDs.forEach(did => {
        expect(refugeeService.validateDID(did)).toBe(false);
      });
    });
  });

  describe('findBeneficiaryByDID', () => {
    beforeEach(async () => {
      // Clear existing refugees
      const refugees = refugeeService._getRegisteredRefugees();
      refugees.length = 0;
    });

    it('should find existing beneficiary', async () => {
      const result = await refugeeService.registerBeneficiary();
      const found = refugeeService.findBeneficiaryByDID(result.did);
      
      expect(found).toBeDefined();
      expect(found.did).toBe(result.did);
      expect(found.qrCode).toBe(result.qrCode);
    });

    it('should return undefined for non-existent beneficiary', () => {
      const found = refugeeService.findBeneficiaryByDID('did:haid:12345678-1234-4123-8123-123456789012');
      expect(found).toBeUndefined();
    });

    it('should return undefined for invalid DID', () => {
      const found = refugeeService.findBeneficiaryByDID('invalid-did');
      expect(found).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle QR code generation errors gracefully', async () => {
      // Mock QRCode.toDataURL to throw an error
      const originalQRCode = require('qrcode');
      const mockQRCode = {
        toDataURL: jest.fn().mockRejectedValue(new Error('QR generation failed'))
      };
      
      jest.doMock('qrcode', () => mockQRCode);

      await expect(refugeeService.registerBeneficiary()).rejects.toThrow('Failed to register beneficiary');
      
      // Restore original module
      jest.doMock('qrcode', () => originalQRCode);
    });
  });
});