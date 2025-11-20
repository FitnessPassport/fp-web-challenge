/**
 * API Middleware
 * Authentication, validation, and error handling
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type User } from '../mocks/auth.js';
import { z, ZodError, ZodSchema } from 'zod';
import { ApiError, ValidationError, isDevelopment } from '../config.js';

// ============================================================================
// Type Extensions
// ============================================================================

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Authentication middleware - Requires valid Bearer token
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new ApiError(401, 'No authorization header provided', 'UNAUTHORIZED');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Invalid authorization header format. Expected: Bearer <token>', 'UNAUTHORIZED');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'No token provided', 'UNAUTHORIZED');
    }

    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED'));
    }
  }
}

// ============================================================================
// Validation Middleware
// ============================================================================

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Invalid query parameters', error.errors));
      } else {
        next(error);
      }
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Invalid request parameters', error.errors));
      } else {
        next(error);
      }
    }
  };
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const schemas = {
  search: z.object({
    keywords: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    radius: z.coerce.number().min(0.1).max(100).optional(),
    amenities: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => (Array.isArray(val) ? val : [val]))
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),

  id: z.object({
    id: z.string().min(1),
  }),
};

// ============================================================================
// Error Handling Middleware
// ============================================================================

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    status: number;
    stack?: string;
    errors?: unknown;
  };
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const code = err instanceof ApiError ? err.code : 'INTERNAL_SERVER_ERROR';

  const errorResponse: ErrorResponse = {
    error: {
      message: err.message || 'An unexpected error occurred',
      code,
      status: statusCode,
    },
  };

  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
  }

  if (err instanceof ApiError && 'errors' in err) {
    errorResponse.error.errors = (err as any).errors;
  }

  console.error('[Error]', {
    message: err.message,
    code,
    status: statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
      status: 404,
    },
  });
}
