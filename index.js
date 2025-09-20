require('dotenv').config();

// Import Module & Declare Variable
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// import DB Conection
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRoutes');
var merchantRoutes = require('./routes/merchantRoutes');
var productRoutes = require('./routes/productRoutes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Define Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRoutes);
app.use('/merchants', merchantRoutes);

// Handle Error
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  const env = req.app.get('env');
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: true,
    message: err.message,
    ...(env === 'development' && { stack: err.stack }),
  });
});

// Set port
const port = process.env.APP_PORT || 4000;

const env = process.env.ENV_TYPE || 'production';

if (env === 'development') {
  // Start server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
