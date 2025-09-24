const { Pool } = require('pg');
const config = require('./index');

/**
 * Database configuration and connection
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'haid_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

/**
 * Initialize database tables
 */
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
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

    // Create collection_logs table for detailed logging
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

    // Create indexes for better performance
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

    client.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};