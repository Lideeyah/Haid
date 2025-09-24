const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const config = require('./config');
const { testConnection, initializeDatabase } = require('./config/database');
const { specs, swaggerUi } = require('./config/swagger');
const { logRequest } = require('./services/logger');
const { setLanguage } = require('./services/i18nService');
const healthRoutes = require('./routes/health');
const eventsRoutes = require('./routes/events');
const collectionsRoutes = require('./routes/collections');
const refugeeRoutes = require('./routes/refugees');
const userRoutes = require('./routes/users');
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      status: 429
    }
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Logging middleware
app.use(morgan('combined'));
app.use(logRequest);

// Multi-language support
app.use(setLanguage);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Haid API Documentation'
}));

// API routes
app.use('/health', healthRoutes);
app.use(config.server.apiPrefix + '/events', eventsRoutes);
app.use(config.server.apiPrefix + '/collections', collectionsRoutes);
app.use(config.server.apiPrefix + '/refugees', refugeeRoutes);
app.use(config.server.apiPrefix + '/users', userRoutes);
app.use(config.server.apiPrefix, (req, res) => {
  res.json({ 
    message: 'Haid API is running', 
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      users: config.server.apiPrefix + '/users',
      refugees: config.server.apiPrefix + '/refugees',
      events: config.server.apiPrefix + '/events',
      collections: config.server.apiPrefix + '/collections'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start server
    app.listen(config.server.port, () => {
      console.log(`🚀 Haid server is running on port ${config.server.port}`);
      console.log(`🌍 Environment: ${config.server.env}`);
      console.log(`🏥 Health check: http://localhost:${config.server.port}/health`);
      console.log(`📚 API Documentation: http://localhost:${config.server.port}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;