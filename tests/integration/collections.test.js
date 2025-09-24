const request = require('supertest');
const app = require('../../src/app');
const { cleanupDatabase, createTestUser, createTestEvent, createTestRefugee, generateTestToken, generateTestDID } = require('../utils/testHelpers');

describe('Collections API', () => {
  let authToken;
  let eventId;
  let refugeeDid;

  beforeEach(async () => {
    await cleanupDatabase();
    await createTestUser();
    authToken = generateTestToken();
    
    const event = await createTestEvent();
    eventId = event.id;
    
    const refugee = await createTestRefugee();
    refugeeDid = refugee.did;
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/v1/collections', () => {
    it('should process collection successfully', async () => {
      const collectionData = {
        refugeeDid,
        eventId
      };

      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Aid collection recorded successfully');
      expect(response.body.data.refugeeDid).toBe(refugeeDid);
      expect(response.body.data.eventId).toBe(eventId);
      expect(response.body.data.transactionId).toBeDefined();
    });

    it('should prevent duplicate collections', async () => {
      const collectionData = {
        refugeeDid,
        eventId
      };

      // First collection should succeed
      await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(201);

      // Second collection should fail
      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('DUPLICATE_CLAIM');
      expect(response.body.message).toContain('already been collected');
    });

    it('should reject invalid refugee DID', async () => {
      const collectionData = {
        refugeeDid: 'invalid-did',
        eventId
      };

      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid event ID', async () => {
      const collectionData = {
        refugeeDid,
        eventId: 'invalid'
      };

      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const collectionData = {
        refugeeDid,
        eventId
      };

      await request(app)
        .post('/api/v1/collections')
        .send(collectionData)
        .expect(401);
    });
  });

  describe('POST /api/v1/collections/manual', () => {
    it('should process manual collection successfully', async () => {
      const collectionData = {
        refugeeDid,
        eventId,
        reason: 'Refugee lost their wristband due to emergency evacuation'
      };

      const response = await request(app)
        .post('/api/v1/collections/manual')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Manual aid collection recorded successfully');
      expect(response.body.data.override).toBe(true);
      expect(response.body.data.reason).toBe(collectionData.reason);
    });

    it('should reject missing reason', async () => {
      const collectionData = {
        refugeeDid,
        eventId
        // Missing reason
      };

      const response = await request(app)
        .post('/api/v1/collections/manual')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject short reason', async () => {
      const collectionData = {
        refugeeDid,
        eventId,
        reason: 'Short'
      };

      const response = await request(app)
        .post('/api/v1/collections/manual')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const collectionData = {
        refugeeDid,
        eventId,
        reason: 'Valid reason for manual collection'
      };

      await request(app)
        .post('/api/v1/collections/manual')
        .send(collectionData)
        .expect(401);
    });
  });

  describe('POST /api/v1/collections/bulk', () => {
    it('should process bulk collections successfully', async () => {
      const refugeeDid2 = generateTestDID();
      const refugeeDid3 = generateTestDID();

      const collectionData = {
        collections: [
          { refugeeDid, eventId },
          { refugeeDid: refugeeDid2, eventId },
          { refugeeDid: refugeeDid3, eventId }
        ]
      };

      const response = await request(app)
        .post('/api/v1/collections/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(200);

      expect(response.body.successful).toHaveLength(3);
      expect(response.body.failed).toHaveLength(0);
    });

    it('should handle mixed success and failure in bulk collections', async () => {
      const refugeeDid2 = generateTestDID();

      const collectionData = {
        collections: [
          { refugeeDid, eventId },
          { refugeeDid, eventId }, // Duplicate - should fail
          { refugeeDid: refugeeDid2, eventId }
        ]
      };

      const response = await request(app)
        .post('/api/v1/collections/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(200);

      expect(response.body.successful).toHaveLength(2);
      expect(response.body.failed).toHaveLength(1);
    });

    it('should reject empty collections array', async () => {
      const collectionData = {
        collections: []
      };

      const response = await request(app)
        .post('/api/v1/collections/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const collectionData = {
        collections: [{ refugeeDid, eventId }]
      };

      await request(app)
        .post('/api/v1/collections/bulk')
        .send(collectionData)
        .expect(401);
    });
  });

  describe('GET /api/v1/collections/status', () => {
    it('should return false for non-collected aid', async () => {
      const response = await request(app)
        .get(`/api/v1/collections/status?refugeeDid=${refugeeDid}&eventId=${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.hasCollected).toBe(false);
    });

    it('should return true for collected aid', async () => {
      // First, collect aid
      await request(app)
        .post('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ refugeeDid, eventId })
        .expect(201);

      // Then check status
      const response = await request(app)
        .get(`/api/v1/collections/status?refugeeDid=${refugeeDid}&eventId=${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.hasCollected).toBe(true);
    });

    it('should reject missing parameters', async () => {
      const response = await request(app)
        .get('/api/v1/collections/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/v1/collections/status?refugeeDid=${refugeeDid}&eventId=${eventId}`)
        .expect(401);
    });
  });
});