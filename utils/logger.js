const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const morgan = require('morgan');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

// format log
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(
    (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
  )
);

// Singleton loggerApp
let loggerApp;
if (!global.loggerApp) {
  global.loggerApp = createLogger({
    format: logFormat,
    transports: [
      // File log info (menyimpan info + warn + error)
      new transports.DailyRotateFile({
        filename: path.join(logDir, 'info-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        level: 'info', // info, warn, error masuk ke sini
      }),

      // File log error khusus error
      new transports.DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        level: 'error',
      }),
    ],
  });
}
loggerApp = global.loggerApp;

// Singleton loggerAccess
let loggerAccess;
if (!global.loggerAccess) {
  global.loggerAccess = createLogger({
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
}
loggerAccess = global.loggerAccess;

// Integrasi Morgan → langsung masuk ke info.log & access.log, tidak ke console
const morganToWinston = morgan('combined', {
  stream: {
    write: (message) => {
      loggerAccess.http(message.trim()); // masuk ke access.log
      loggerApp.info(message.trim()); // masuk ke info.log (tidak ke console)
    },
  },
});

module.exports = { loggerApp, morganToWinston };
