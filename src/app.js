const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const config = require('./config');
const healthRoutes = require('./routes/health');
const collectionsRoutes = require('./routes/collections');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/health', healthRoutes);
app.use(config.server.apiPrefix + '/collections', collectionsRoutes);
app.use(config.server.apiPrefix, (req, res) => {
  res.json({ message: 'Haid API is running', version: '1.0.0' });
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

app.listen(config.server.port, () => {
  console.log(`🚀 Haid server is running on port ${config.server.port}`);
  console.log(`🌍 Environment: ${config.server.env}`);
  console.log(`🏥 Health check: http://localhost:${config.server.port}/health`);
});

module.exports = app;