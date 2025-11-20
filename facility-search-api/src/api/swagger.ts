/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { appConfig } from '../config.js';

// TODO: we could define the API interface once using zod and then use that to generate the swagger documentation
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Facility Search API',
      version: '1.0.0',
      description: 'RESTful API for searching and filtering fitness facilities',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${appConfig.port}${appConfig.apiPrefix}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Bearer token',
        },
      },
      schemas: {
        Facility: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'facility-001' },
            name: { type: 'string', example: 'City Fitness Central' },
            address1: { type: 'string', example: '123 Market St' },
            address2: { type: 'string', nullable: true },
            suburb: { type: 'string', example: 'Sydney' },
            state: { type: 'string', example: 'NSW' },
            postCode: { type: 'string', example: '2000' },
            country: { type: 'string', example: 'Australia' },
            latitude: { type: 'number', example: -33.8703 },
            longitude: { type: 'number', example: 151.208 },
            amenities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Pool', 'Sauna', '24/7 Access'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'string' },
                status: { type: 'number' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/api/routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };

