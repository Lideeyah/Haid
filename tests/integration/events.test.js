const request = require('supertest');
const app = require('../../src/app');
const { cleanupDatabase, createTestUser, createTestEvent, generateTestToken } = require('../utils/testHelpers');

describe('Events API', () => {
  let authToken;

  beforeEach(async () => {
    await cleanupDatabase();
    await createTestUser();
    authToken = generateTestToken();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/v1/events', () => {
    it('should create a new event successfully', async () => {
      const eventData = {
        name: 'Morning Food Distribution',
        date: '2024-01-15T10:00:00Z',
        location: 'Refugee Camp A',
        ngoId: 1
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(eventData.name);
      expect(response.body.data.location).toBe(eventData.location);
      expect(response.body.data.ngoId).toBe(eventData.ngoId);
      expect(response.body.data.status).toBe('active');
    });

    it('should reject invalid date format', async () => {
      const eventData = {
        name: 'Test Event',
        date: 'invalid-date',
        location: 'Test Location',
        ngoId: 1
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const eventData = {
        name: 'Test Event'
        // Missing date, location, ngoId
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const eventData = {
        name: 'Test Event',
        date: '2024-01-15T10:00:00Z',
        location: 'Test Location',
        ngoId: 1
      };

      await request(app)
        .post('/api/v1/events')
        .send(eventData)
        .expect(401);
    });
  });

  describe('GET /api/v1/events', () => {
    beforeEach(async () => {
      await createTestEvent({ name: 'Event 1', location: 'Camp A' });
      await createTestEvent({ name: 'Event 2', location: 'Camp B' });
      await createTestEvent({ name: 'Event 3', location: 'Camp A' });
    });

    it('should get all events', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    it('should filter events by location', async () => {
      const response = await request(app)
        .get('/api/v1/events?location=Camp A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(event => {
        expect(event.location).toBe('Camp A');
      });
    });

    it('should filter events by date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/v1/events?date=${today}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(event => {
        expect(event.date).toMatch(new RegExp(`^${today}`));
      });
    });

    it('should filter events by NGO ID', async () => {
      const response = await request(app)
        .get('/api/v1/events?ngoId=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(event => {
        expect(event.ngoId).toBe(1);
      });
    });
  });

  describe('GET /api/v1/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await createTestEvent();
      eventId = event.id;
    });

    it('should get event by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/events/${eventId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(eventId);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/v1/events/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Event not found');
    });

    it('should reject invalid event ID', async () => {
      const response = await request(app)
        .get('/api/v1/events/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await createTestEvent();
      eventId = event.id;
    });

    it('should update event successfully', async () => {
      const updateData = {
        name: 'Updated Event Name',
        location: 'Updated Location'
      };

      const response = await request(app)
        .put(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.location).toBe(updateData.location);
    });

    it('should require authentication', async () => {
      const updateData = {
        name: 'Updated Event Name'
      };

      await request(app)
        .put(`/api/v1/events/${eventId}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 404 for non-existent event', async () => {
      const updateData = {
        name: 'Updated Event Name'
      };

      const response = await request(app)
        .put('/api/v1/events/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await createTestEvent();
      eventId = event.id;
    });

    it('should delete event successfully', async () => {
      await request(app)
        .delete(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify event is deleted
      const response = await request(app)
        .get(`/api/v1/events/${eventId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/v1/events/${eventId}`)
        .expect(401);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/v1/events/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/events/export', () => {
    beforeEach(async () => {
      await createTestEvent({ name: 'Event 1' });
      await createTestEvent({ name: 'Event 2' });
    });

    it('should export events to CSV', async () => {
      const response = await request(app)
        .get('/api/v1/events/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('events.csv');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/events/export')
        .expect(401);
    });
  });
});