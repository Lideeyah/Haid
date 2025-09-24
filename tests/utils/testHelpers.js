const jwt = require('jsonwebtoken');
const { pool } = require('../../src/config/database');

/**
 * Test helper utilities
 */

/**
 * Generate a test JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateTestToken = (payload = {}) => {
  const defaultPayload = {
    id: 1,
    email: 'test@example.com',
    role: 'NGO',
    ...payload
  };
  
  return jwt.sign(defaultPayload, 'test-jwt-secret', { expiresIn: '1h' });
};

/**
 * Generate test refugee DID
 * @returns {string} Test DID
 */
const generateTestDID = () => {
  return `did:haid:${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Clean up test database
 */
const cleanupDatabase = async () => {
  const client = await pool.connect();
  try {
    // Delete in reverse order of dependencies
    await client.query('DELETE FROM collection_logs');
    await client.query('DELETE FROM collections');
    await client.query('DELETE FROM events');
    await client.query('DELETE FROM refugees');
    await client.query('DELETE FROM users');
    
    // Reset sequences
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE events_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE collections_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE collection_logs_id_seq RESTART WITH 1');
  } finally {
    client.release();
  }
};

/**
 * Create test user
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const createTestUser = async (userData = {}) => {
  const client = await pool.connect();
  try {
    const defaultUser = {
      email: 'test@example.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', // 'password'
      role: 'NGO',
      ...userData
    };
    
    const result = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [defaultUser.email, defaultUser.password_hash, defaultUser.role]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

/**
 * Create test event
 * @param {Object} eventData - Event data
 * @returns {Object} Created event
 */
const createTestEvent = async (eventData = {}) => {
  const client = await pool.connect();
  try {
    const defaultEvent = {
      name: 'Test Event',
      date: new Date().toISOString(),
      location: 'Test Location',
      ngo_id: 1,
      status: 'active',
      ...eventData
    };
    
    const result = await client.query(
      'INSERT INTO events (name, date, location, ngo_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [defaultEvent.name, defaultEvent.date, defaultEvent.location, defaultEvent.ngo_id, defaultEvent.status]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

/**
 * Create test refugee
 * @param {Object} refugeeData - Refugee data
 * @returns {Object} Created refugee
 */
const createTestRefugee = async (refugeeData = {}) => {
  const client = await pool.connect();
  try {
    const defaultRefugee = {
      did: generateTestDID(),
      qr_code: 'data:image/png;base64,test-qr-code',
      ...refugeeData
    };
    
    const result = await client.query(
      'INSERT INTO refugees (did, qr_code) VALUES ($1, $2) RETURNING *',
      [defaultRefugee.did, defaultRefugee.qr_code]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

/**
 * Create test collection
 * @param {Object} collectionData - Collection data
 * @returns {Object} Created collection
 */
const createTestCollection = async (collectionData = {}) => {
  const client = await pool.connect();
  try {
    const defaultCollection = {
      refugee_did: generateTestDID(),
      event_id: 1,
      transaction_id: 'test-tx-id',
      consensus_timestamp: new Date().toISOString(),
      guardian_topic_id: '0.0.123456',
      override: false,
      ...collectionData
    };
    
    const result = await client.query(
      'INSERT INTO collections (refugee_did, event_id, transaction_id, consensus_timestamp, guardian_topic_id, override) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [defaultCollection.refugee_did, defaultCollection.event_id, defaultCollection.transaction_id, defaultCollection.consensus_timestamp, defaultCollection.guardian_topic_id, defaultCollection.override]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateTestToken,
  generateTestDID,
  cleanupDatabase,
  createTestUser,
  createTestEvent,
  createTestRefugee,
  createTestCollection,
  wait
};