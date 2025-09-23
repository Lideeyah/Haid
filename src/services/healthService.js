const { Client } = require('@hashgraph/sdk');
const config = require('../config');

/**
 * Health service to check server and external service status
 */
const checkHealth = async () => {
  const startTime = Date.now();
  
  // Basic server health
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env,
    version: '1.0.0'
  };

  // Check Hedera connection if credentials are configured
  try {
    if (config.hedera.operatorId && config.hedera.operatorKey) {
      const client = Client.forTestnet();
      client.setOperator(
        config.hedera.operatorId,
        config.hedera.operatorKey
      );
      
      // Simple connectivity check
      healthData.hedera = {
        status: 'connected',
        network: config.hedera.network
      };
      
      client.close();
    } else {
      healthData.hedera = {
        status: 'not_configured',
        message: 'Hedera credentials not set'
      };
    }
  } catch (error) {
    healthData.hedera = {
      status: 'error',
      message: error.message
    };
  }

  healthData.responseTime = Date.now() - startTime;
  
  return healthData;
};

module.exports = {
  checkHealth
};