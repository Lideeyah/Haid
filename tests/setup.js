const { Pool } = require('pg');
const testConfig = require('../src/config/test');

/**
 * Test setup and teardown
 */

// Create test database connection
const testPool = new Pool({
  host: testConfig.database.host,
  port: testConfig.database.port,
  database: testConfig.database.database,
  user: testConfig.database.user,
  password: testConfig.database.password,
  ssl: false
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = testConfig.jwt.secret;
process.env.HEDERA_OPERATOR_ID = testConfig.hedera.operatorId;
process.env.HEDERA_OPERATOR_KEY = testConfig.hedera.operatorKey;
process.env.HEDERA_GUARDIAN_TOPIC_ID = testConfig.hedera.guardianTopicId;

// Global test setup
beforeAll(async () => {
  try {
    // Test database connection
    const client = await testPool.connect();
    console.log('✅ Test database connected');
    client.release();

    // Initialize test database tables
    await initializeTestDatabase();
  } catch (error) {
    console.error('❌ Test database connection failed:', error.message);
    process.exit(1);
  }
});

// Global test teardown
afterAll(async () => {
  try {
    await testPool.end();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Error closing test database:', error.message);
  }
});

/**
 * Initialize test database tables
 */
async function initializeTestDatabase() {
  const client = await testPool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'NGO', 'volunteer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create refugees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refugees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        did VARCHAR(255) UNIQUE NOT NULL,
        qr_code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        ngo_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create collections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        refugee_did VARCHAR(255) NOT NULL,
        event_id INTEGER REFERENCES events(id),
        transaction_id VARCHAR(255),
        consensus_timestamp TIMESTAMP,
        guardian_topic_id VARCHAR(255),
        override BOOLEAN DEFAULT FALSE,
        override_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(refugee_did, event_id)
      )
    `);

    // Create collection_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS collection_logs (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id),
        refugee_did VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'duplicate_prevented', 'manual_override')),
        items_collected TEXT[],
        attempted_items TEXT[],
        location_hash VARCHAR(255),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collections_refugee_event 
      ON collections(refugee_did, event_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collections_event_id 
      ON collections(event_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collection_logs_event_id 
      ON collection_logs(event_id)
    `);

    console.log('✅ Test database tables initialized');
  } catch (error) {
    console.error('❌ Test database initialization failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Export test pool for use in tests
module.exports = { testPool };