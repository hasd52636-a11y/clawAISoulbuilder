/**
 * Error handling middleware for Express
 * Catches and formats all errors in a consistent way
 */

import express from 'express';
import { isClawNexusError, toClawNexusError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Global error handling middleware
 * Should be added as the last middleware in the Express app
 */
export function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  // Convert to ClawNexusError if needed
  const error = toClawNexusError(err);

  // Get request ID for tracking
  const requestId = (req as any).id || 'unknown';

  // Log the error
  if (error.statusCode >= 500) {
    logger.error(`[${requestId}] ${error.message}`, err, {
      code: error.code,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn(`[${requestId}] ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Build error response
  const response: ErrorResponse = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  // Include details in development mode
  if (process.env.NODE_ENV !== 'production' && error.details) {
    response.error.details = error.details;
  }

  // Send response
  res.status(error.statusCode).json(response);
}

/**
 * Async error wrapper for Express route handlers
 * Catches errors in async functions and passes them to error handler
 */
export function asyncHandler(fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found middleware
 * Should be added after all other routes
 */
export function notFoundHandler(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  (error as any).statusCode = 404;
  (error as any).code = 'NOT_FOUND';
  next(error);
}

/**
 * Request ID middleware
 * Adds a unique ID to each request for tracking
 */
export function requestIdMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

/**
 * Validation error middleware
 * Catches validation errors from express-validator
 */
export function validationErrorMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
  // This is a placeholder for express-validator integration
  // In a real implementation, you would check for validation errors here
  next();
}

export default {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  requestIdMiddleware,
  validationErrorMiddleware,
};
