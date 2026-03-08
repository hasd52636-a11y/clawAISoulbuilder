"use strict";
/**
 * Error handling middleware for Express
 * Catches and formats all errors in a consistent way
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.notFoundHandler = notFoundHandler;
exports.requestIdMiddleware = requestIdMiddleware;
exports.validationErrorMiddleware = validationErrorMiddleware;
const errors_js_1 = require("../utils/errors.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Global error handling middleware
 * Should be added as the last middleware in the Express app
 */
function errorHandler(err, req, res, next) {
    // Convert to ClawNexusError if needed
    const error = (0, errors_js_1.toClawNexusError)(err);
    // Get request ID for tracking
    const requestId = req.id || 'unknown';
    // Log the error
    if (error.statusCode >= 500) {
        logger_js_1.logger.error(`[${requestId}] ${error.message}`, err, {
            code: error.code,
            statusCode: error.statusCode,
            path: req.path,
            method: req.method,
        });
    }
    else {
        logger_js_1.logger.warn(`[${requestId}] ${error.message}`, {
            code: error.code,
            statusCode: error.statusCode,
            path: req.path,
            method: req.method,
        });
    }
    // Build error response
    const response = {
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
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * 404 Not Found middleware
 * Should be added after all other routes
 */
function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.path}`);
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    next(error);
}
/**
 * Request ID middleware
 * Adds a unique ID to each request for tracking
 */
function requestIdMiddleware(req, res, next) {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.id = requestId;
    res.setHeader('x-request-id', requestId);
    next();
}
/**
 * Validation error middleware
 * Catches validation errors from express-validator
 */
function validationErrorMiddleware(req, res, next) {
    // This is a placeholder for express-validator integration
    // In a real implementation, you would check for validation errors here
    next();
}
exports.default = {
    errorHandler,
    asyncHandler,
    notFoundHandler,
    requestIdMiddleware,
    validationErrorMiddleware,
};
