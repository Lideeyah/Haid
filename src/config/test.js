/**
 * Test configuration
 */
module.exports = {
  server: {
    port: process.env.TEST_PORT || 3001,
    env: 'test',
    apiPrefix: '/api/v1'
  },
  
  hedera: {
    network: 'testnet',
    operatorId: 'test-operator-id',
    operatorKey: 'test-operator-key',
    guardianTopicId: '0.0.123456'
  },
  
  security: {
    corsOrigin: '*'
  },
  
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    database: process.env.TEST_DB_NAME || 'haid_test_db',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password'
  },
  
  jwt: {
    secret: 'test-jwt-secret',
    expiresIn: '1h'
  }
};