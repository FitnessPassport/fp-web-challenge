/**
 * Express server setup and initialization
 */

import express, { type Express } from 'express';
import cors from 'cors';
import routes from './api/routes.js';
import { errorHandler, notFoundHandler } from './api/middleware.js';
import { appConfig } from './config.js';
import { swaggerUi, swaggerSpec } from './api/swagger.js';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Middleware chain
  // 1. CORS
  app.use(
    cors({
      origin: appConfig.corsOrigins,
      credentials: true,
    }),
  );

  // 2. Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Request logging (simple console log in development)
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // 4. API Documentation (Swagger)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 5. API routes
  app.use(appConfig.apiPrefix, routes);

  // 6. 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // 7. Error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
export function startServer(): void {
  const app = createApp();

  app.listen(appConfig.port, () => {
    console.log('='.repeat(50));
    console.log('🚀 Facility Search API');
    console.log('='.repeat(50));
    console.log(`Environment: ${appConfig.env}`);
    console.log(`Server running on: http://localhost:${appConfig.port}`);
    console.log(`API base path: ${appConfig.apiPrefix}`);
    console.log('='.repeat(50));
    console.log('\nAvailable endpoints:');
    console.log(`  GET  ${appConfig.apiPrefix}/facilities/status  - Health check`);
    console.log(`  GET  ${appConfig.apiPrefix}/facilities         - Search facilities (auth required)`);
    console.log(`  GET  ${appConfig.apiPrefix}/facilities/:id     - Get facility by ID (auth required)`);
    console.log('\n📚 API Documentation:');
    console.log(`  http://localhost:${appConfig.port}/api-docs`);
    console.log('='.repeat(50));
  });
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

