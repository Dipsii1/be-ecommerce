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
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const merchantOrderRoutes = require('./routes/merchantOrder');

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

// Define Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRoutes);
app.use('/merchants', merchantRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/merchant/orders', merchantOrderRoutes);

// Swagger UI
app.use(
  '/api-docs/v1/be-crafix',
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
    `${chalk.blue('📖 Swagger Docs:')} ${chalk.underline.cyan(`http://localhost:${port}/api-docs/v1/be-crafix`)}`
  );
  console.log(
    `${chalk.blue('📖 Http:')} ${chalk.underline.cyan(`http://localhost:${port}`)}`
  );
});

module.exports = app;
