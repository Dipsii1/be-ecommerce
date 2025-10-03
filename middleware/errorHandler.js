const { logger } = require('../utils/logger');

// Handler untuk 404
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;

  // log 404 sebagai warning
  logger.warn(error.message);

  next(error);
};

// Handler untuk error global
const errorHandler = (err, req, res) => {
  const status = err.status || 500;
  const message =
    status === 404 ? 'Resource not found' : 'Internal Server Error';

  // Log sesuai level
  if (status === 404) {
    logger.warn(`${status} - ${err.message} - ${req.originalUrl}`);
  } else {
    logger.error(`${status} - ${err.message} - ${req.originalUrl}`, {
      stack: err.stack,
    });
  }

  res.status(status).json({
    message,
    error: process.env.ENV_TYPE === 'development' ? err.message : undefined,
  });
};

module.exports = { notFound, errorHandler };
