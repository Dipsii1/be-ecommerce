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
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // format token yang digunakan
        },
      },
    },
    security: [
      {
        bearerAuth: [], // otomatis apply ke semua endpoint, bisa di override di level route
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
