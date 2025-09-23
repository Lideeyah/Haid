/**
 * Application configuration
 */
module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1'
  },
  
  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    operatorId: process.env.HEDERA_OPERATOR_ID,
    operatorKey: process.env.HEDERA_OPERATOR_KEY,
    guardianTopicId: process.env.HEDERA_GUARDIAN_TOPIC_ID
  },
  
  security: {
    corsOrigin: process.env.NODE_ENV === 'production' ? false : '*'
  }
};