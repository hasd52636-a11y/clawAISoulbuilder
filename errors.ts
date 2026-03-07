/**
 * Error classes for ClawNexus system
 * Provides structured error handling with proper HTTP status codes
 */

export class ClawNexusError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ClawNexusError';
    Object.setPrototypeOf(this, ClawNexusError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class ValidationError extends ClawNexusError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', 400, message, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends ClawNexusError {
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', 401, message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ClawNexusError {
  constructor(message: string = 'Access denied') {
    super('AUTHORIZATION_ERROR', 403, message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends ClawNexusError {
  constructor(resource: string, details?: any) {
    super('NOT_FOUND', 404, `${resource} not found`, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends ClawNexusError {
  constructor(message: string, details?: any) {
    super('CONFLICT', 409, message, details);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends ClawNexusError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', 429, message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class InternalError extends ClawNexusError {
  constructor(message: string, details?: any) {
    super('INTERNAL_ERROR', 500, message, details);
    this.name = 'InternalError';
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export class DatabaseError extends ClawNexusError {
  constructor(message: string, details?: any) {
    super('DATABASE_ERROR', 500, message, details);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExternalServiceError extends ClawNexusError {
  constructor(service: string, message: string, details?: any) {
    super('EXTERNAL_SERVICE_ERROR', 502, `${service} error: ${message}`, details);
    this.name = 'ExternalServiceError';
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

export class TimeoutError extends ClawNexusError {
  constructor(operation: string) {
    super('TIMEOUT', 504, `${operation} timed out`);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Check if an error is a ClawNexusError
 */
export function isClawNexusError(error: any): error is ClawNexusError {
  return error instanceof ClawNexusError;
}

/**
 * Convert any error to ClawNexusError
 */
export function toClawNexusError(error: any): ClawNexusError {
  if (isClawNexusError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalError(error.message, { originalError: error.name });
  }

  return new InternalError('An unknown error occurred', { error });
}

export default {
  ClawNexusError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  DatabaseError,
  ExternalServiceError,
  TimeoutError,
  isClawNexusError,
  toClawNexusError,
};
