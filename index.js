require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const chalk = require('chalk');

// Swagger
const { swaggerUi, specs } = require('./docs/swagger');

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/usersRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const productRoutes = require('./routes/productRoutes');

// Logger & Error Handler
const { morganToWinston } = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware umum
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Logger (Morgan → Winston)
app.use(morganToWinston);

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRoutes);
app.use('/merchants', merchantRoutes);

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: 'be-crafix API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const port = process.env.APP_PORT || 4000;
const env = process.env.ENV_TYPE || 'production';

app.listen(port, () => {
  // Console log dengan chalk
  console.log(chalk.green.bold('🚀 Server is running!'));
  console.log(`${chalk.blue('📌 Mode:')} ${chalk.yellow(env)}`);
  console.log(`${chalk.blue('🌐 Port:')} ${chalk.cyan(port)}`);
  console.log(
    `${chalk.blue('📖 Swagger Docs:')} ${chalk.underline.cyan(`http://localhost:${port}/api-docs/be-crafix`)}`
  );
});

module.exports = app;
