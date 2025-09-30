// src/middleware/errorHandler.js
const winston = require('winston');

// Use the same logger as in index.js
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});

function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    user: req.user ? req.user.id : undefined,
  });
  // Always print error to console for Render logs
  console.error("ERROR:", err.stack || err);

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });
}

module.exports = errorHandler;