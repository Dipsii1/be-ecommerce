const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation for be-crafix',
      version: '1.0.0',
      description: 'Dokumentasi API untuk be-crafix',
    },
    servers: [
      {
        url: 'http://localhost:8080', // sesuaikan dengan port
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Swagger akan baca semua file di folder routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
