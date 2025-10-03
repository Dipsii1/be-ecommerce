const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(
    ({ level, message, timestamp }) =>
      `${timestamp} [${level.toUpperCase()}]: ${message}`
  )
);

// Logger Aplikasi
const loggerApp = createLogger({
  format: logFormat,
  transports: [
    new transports.Console({ level: 'debug' }),
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'info-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'info',
    }),
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'error',
    }),
  ],
});

// Logger Access
const loggerAccess = createLogger({
  format: logFormat,
  transports: [
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'http',
    }),
  ],
});

// Integrasi Morgan → loggerAccess
const morganToWinston = morgan('combined', {
  stream: {
    write: (message) => loggerAccess.http(message.trim()),
  },
});

module.exports = { morganToWinston, loggerApp };
