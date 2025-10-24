// app.js - Enhanced HAID API Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import existing routes
const healthRoutes = require('./routes/health');
const eventsRoutes = require('./routes/events');
const collectionsRoutes = require('./routes/collections');
const refugeeRoutes = require('./routes/refugees');

// Import new routes (you'll need to create these)
const scanRoutes = require('./routes/scans');
const verifyRoutes = require('./routes/verify');
const auditRoutes = require('./routes/audit');
const dashboardRoutes = require('./routes/dashboard');
const didRoutes = require('./routes/did');

// Import config with fallback
let config;
try {
  config = require('./config');
} catch (err) {
  // Fallback config if config.js doesn't exist
  config = {
    server: {
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development',
      apiPrefix: process.env.API_PREFIX || '/api'
    },
    security: {
      corsOrigin: process.env.CORS_ORIGIN || '*'
    }
  };
  console.log('⚠️ Using fallback config (config.js not found)');
}

const app = express();

// ============ MIDDLEWARE ============

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
if (config.server.env !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timestamp
app.use((req, res, next) => {
  req.timestamp = new Date().toISOString();
  next();
});

// ============ API ROUTES ============

// Health check (no prefix)
app.use('/health', healthRoutes);

// Core HAID endpoints
app.use(config.server.apiPrefix + '/scan', scanRoutes);           // POST /api/scan - Main scan endpoint
app.use(config.server.apiPrefix + '/verify', verifyRoutes);       // GET /api/verify/:did - Verify immutability
app.use(config.server.apiPrefix + '/audit', auditRoutes);         // GET /api/audit/:did - Full audit trail
app.use(config.server.apiPrefix + '/dashboard', dashboardRoutes); // GET /api/dashboard/donor|auditor
app.use(config.server.apiPrefix + '/did', didRoutes);             // DID management endpoints

// Legacy/existing routes
app.use(config.server.apiPrefix + '/events', eventsRoutes);
app.use(config.server.apiPrefix + '/collections', collectionsRoutes);
app.use(config.server.apiPrefix + '/refugees', refugeeRoutes);

// Root API endpoint - API info
app.get(config.server.apiPrefix, (req, res) => {
  res.json({
    message: 'HAID API - Humanitarian Aid Immutable Distribution',
    version: '1.0.0',
    description: 'Blockchain-verified aid distribution using Hedera Consensus Service',
    endpoints: {
      scan: {
        method: 'POST',
        path: config.server.apiPrefix + '/scan',
        description: 'Scan wristband and log aid distribution to HCS'
      },
      verify: {
        method: 'GET',
        path: config.server.apiPrefix + '/verify/:did',
        description: 'Verify event immutability via HCS consensus'
      },
      audit: {
        method: 'GET',
        path: config.server.apiPrefix + '/audit/:did',
        description: 'Get complete audit trail for a DID'
      },
      donorDashboard: {
        method: 'GET',
        path: config.server.apiPrefix + '/dashboard/donor',
        description: 'Donor impact statistics'
      },
      auditorDashboard: {
        method: 'GET',
        path: config.server.apiPrefix + '/dashboard/auditor',
        description: 'Auditor transparency dashboard'
      },
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      }
    },
    hcsTopics: {
      events: process.env.HAID_EVENTS_TOPIC_ID || 'not_configured',
      scans: process.env.HAID_SCANS_TOPIC_ID || 'not_configured'
    },
    timestamp: req.timestamp
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'HAID - Humanitarian Aid Immutable Distribution',
    status: 'running',
    version: '1.0.0',
    documentation: config.server.apiPrefix,
    health: '/health',
    timestamp: req.timestamp
  });
});

// ============ ERROR HANDLING ============

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Log error details for debugging
  if (config.server.env === 'development') {
    console.error('Stack:', err.stack);
    console.error('Request:', {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query
    });
  }
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      timestamp: req.timestamp,
      path: req.path,
      ...(config.server.env === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.path,
      method: req.method,
      timestamp: req.timestamp,
      availableEndpoints: config.server.apiPrefix
    }
  });
});

// ============ SERVER STARTUP ============

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 HAID Server Started Successfully');
  console.log('='.repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${config.server.env}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}${config.server.apiPrefix}`);
  console.log('\n📍 Core Endpoints:');
  console.log(`   POST   http://localhost:${PORT}${config.server.apiPrefix}/scan`);
  console.log(`   GET    http://localhost:${PORT}${config.server.apiPrefix}/verify/:did`);
  console.log(`   GET    http://localhost:${PORT}${config.server.apiPrefix}/audit/:did`);
  console.log(`   GET    http://localhost:${PORT}${config.server.apiPrefix}/dashboard/donor`);
  console.log(`   GET    http://localhost:${PORT}${config.server.apiPrefix}/dashboard/auditor`);
  console.log('\n🔗 HCS Topics:');
  console.log(`   Events: ${process.env.HAID_EVENTS_TOPIC_ID || '❌ Not configured'}`);
  console.log(`   Scans:  ${process.env.HAID_SCANS_TOPIC_ID || '❌ Not configured'}`);
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏳ SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏳ SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;