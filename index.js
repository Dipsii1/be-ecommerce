require('dotenv').config();

// Import Module & Declare Variable
const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Swagger
const { swaggerUi, specs } = require('./utils/swagger');

// import Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/usersRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRoutes);
app.use('/merchants', merchantRoutes);

// Loger
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

app.use(
  morgan('combined', accessLogStream, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Set port
const chalk = require('chalk');
const port = process.env.APP_PORT || 4000;
const env = process.env.ENV_TYPE || 'production';

if (env === 'development') {
  app.listen(port, () => {
    console.log(chalk.green.bold('🚀 Server is running!'));
    console.log(`${chalk.blue('📌 Mode:')} ${chalk.yellow(env)}`);
    console.log(`${chalk.blue('🌐 Port:')} ${chalk.cyan(port)}`);
    console.log(
      `${chalk.blue('📖 Swagger Docs:')} ${chalk.underline.cyan(`http://localhost:${port}/api-docs`)}`
    );
    console.log(
      `${chalk.blue('📖 HTTPS:')} ${chalk.underline.cyan(`http://localhost:${port}`)}`
    );
  });
}

module.exports = app;
