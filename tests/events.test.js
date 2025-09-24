const request = require('supertest');
const app = require('../src/app');

describe('Events API', () => {
  it('should get all events', async () => {
    const res = await request(app).get('/api/v1/events');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
  });

  it('should not create an event without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({
        name: 'Test Event',
        date: '2025-12-31T23:59:59.999Z',
        location: 'Test Location',
        ngoId: 'test-ngo'
      });
    expect(res.statusCode).toEqual(401);
  });
});
