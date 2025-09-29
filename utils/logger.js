const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Pastikan folder logs ada
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [
    // Log ke console
    new transports.Console({ level: 'debug' }),

    // Log info
    new transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
    }),

    // Log error
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  ],
});

module.exports = logger;
