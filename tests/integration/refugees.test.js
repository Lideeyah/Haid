const request = require('supertest');
const app = require('../../src/app');
const { cleanupDatabase, createTestUser, generateTestToken, generateTestDID } = require('../utils/testHelpers');

describe('Refugees API', () => {
  let authToken;

  beforeEach(async () => {
    await cleanupDatabase();
    await createTestUser();
    authToken = generateTestToken();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/v1/refugees', () => {
    it('should register a new refugee successfully', async () => {
      const response = await request(app)
        .post('/api/v1/refugees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.message).toBe('Beneficiary registered successfully');
      expect(response.body.did).toMatch(/^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('should generate unique DIDs for each refugee', async () => {
      const response1 = await request(app)
        .post('/api/v1/refugees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      const response2 = await request(app)
        .post('/api/v1/refugees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response1.body.did).not.toBe(response2.body.did);
    });

    it('should generate valid QR codes', async () => {
      const response = await request(app)
        .post('/api/v1/refugees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.qrCode).toBeDefined();
      expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);
      
      // Verify QR code contains the DID
      const qrCodeData = response.body.qrCode.split(',')[1];
      const decodedData = Buffer.from(qrCodeData, 'base64').toString();
      expect(decodedData).toBe(response.body.did);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/refugees')
        .expect(401);
    });

    it('should handle multiple concurrent registrations', async () => {
      const promises = Array(5).fill().map(() => 
        request(app)
          .post('/api/v1/refugees')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.did).toBeDefined();
        expect(response.body.qrCode).toBeDefined();
      });

      // Verify all DIDs are unique
      const dids = responses.map(r => r.body.did);
      const uniqueDids = [...new Set(dids)];
      expect(uniqueDids.length).toBe(dids.length);
    });
  });

  describe('DID Validation', () => {
    it('should validate DID format in services', async () => {
      const { validateDID } = require('../../src/services/refugeeService');
      
      // Valid DIDs
      expect(validateDID('did:haid:12345678-1234-4123-8123-123456789012')).toBe(true);
      expect(validateDID('did:haid:87654321-4321-1234-1234-210987654321')).toBe(true);
      
      // Invalid DIDs
      expect(validateDID('did:haid:invalid')).toBe(false);
      expect(validateDID('did:other:12345678-1234-4123-8123-123456789012')).toBe(false);
      expect(validateDID('not-a-did')).toBe(false);
      expect(validateDID('')).toBe(false);
    });
  });
});