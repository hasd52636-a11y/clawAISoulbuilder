"use strict";
/**
 * Error classes for ClawNexus system
 * Provides structured error handling with proper HTTP status codes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = exports.ExternalServiceError = exports.DatabaseError = exports.InternalError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ClawNexusError = void 0;
exports.isClawNexusError = isClawNexusError;
exports.toClawNexusError = toClawNexusError;
class ClawNexusError extends Error {
    constructor(code, statusCode, message, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
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
exports.ClawNexusError = ClawNexusError;
class ValidationError extends ClawNexusError {
    constructor(message, details) {
        super('VALIDATION_ERROR', 400, message, details);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ClawNexusError {
    constructor(message = 'Authentication failed') {
        super('AUTH_ERROR', 401, message);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ClawNexusError {
    constructor(message = 'Access denied') {
        super('AUTHORIZATION_ERROR', 403, message);
        this.name = 'AuthorizationError';
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends ClawNexusError {
    constructor(resource, details) {
        super('NOT_FOUND', 404, `${resource} not found`, details);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ClawNexusError {
    constructor(message, details) {
        super('CONFLICT', 409, message, details);
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends ClawNexusError {
    constructor(message = 'Rate limit exceeded') {
        super('RATE_LIMIT_EXCEEDED', 429, message);
        this.name = 'RateLimitError';
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
exports.RateLimitError = RateLimitError;
class InternalError extends ClawNexusError {
    constructor(message, details) {
        super('INTERNAL_ERROR', 500, message, details);
        this.name = 'InternalError';
        Object.setPrototypeOf(this, InternalError.prototype);
    }
}
exports.InternalError = InternalError;
class DatabaseError extends ClawNexusError {
    constructor(message, details) {
        super('DATABASE_ERROR', 500, message, details);
        this.name = 'DatabaseError';
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends ClawNexusError {
    constructor(service, message, details) {
        super('EXTERNAL_SERVICE_ERROR', 502, `${service} error: ${message}`, details);
        this.name = 'ExternalServiceError';
        Object.setPrototypeOf(this, ExternalServiceError.prototype);
    }
}
exports.ExternalServiceError = ExternalServiceError;
class TimeoutError extends ClawNexusError {
    constructor(operation) {
        super('TIMEOUT', 504, `${operation} timed out`);
        this.name = 'TimeoutError';
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Check if an error is a ClawNexusError
 */
function isClawNexusError(error) {
    return error instanceof ClawNexusError;
}
/**
 * Convert any error to ClawNexusError
 */
function toClawNexusError(error) {
    if (isClawNexusError(error)) {
        return error;
    }
    if (error instanceof Error) {
        return new InternalError(error.message, { originalError: error.name });
    }
    return new InternalError('An unknown error occurred', { error });
}
exports.default = {
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
