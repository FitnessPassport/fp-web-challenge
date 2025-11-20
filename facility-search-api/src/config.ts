/**
 * Application configuration
 * Centralized config for environment variables and constants
 */

export const appConfig = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  
  // API configuration
  apiVersion: 'v1',
  apiPrefix: '/v1',
  
  // Pagination defaults
  defaultLimit: 20,
  maxLimit: 100,
  
  // Search defaults
  defaultRadius: 5, // kilometers
  maxRadius: 100, // kilometers
  
  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  
  // Rate limiting (TODO: STRETCH GOAL)
  // rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  // rateLimitMax: 100, // requests per window
};

export const isDevelopment = appConfig.env === 'development';
export const isProduction = appConfig.env === 'production';
export const isTest = appConfig.env === 'test';

/**
 * Database configuration
 * 
 * TODO: PRODUCTION - Uncomment and configure for PostgreSQL
 * 
 * This file shows where to set up the database connection pool
 * when moving from mock data to a real database.
 */

/*
// Example PostgreSQL configuration with pg library:

import { Pool } from 'pg';

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'facility_search',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  console.log('Database pool closed');
});
*/

/*
// Example with Prisma ORM:

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Test connection
prisma.$connect()
  .then(() => console.log('Database connected'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(-1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
});
*/

// For now, we use mock data - no database connection needed
export const useMockData = true;

/**
 * Custom error classes for API error handling
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public errors?: unknown) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
  }
}

