"use strict";
/**
 * Input validation utilities for ClawNexus
 * Provides validation functions for common data types and formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequired = validateRequired;
exports.validateString = validateString;
exports.validateEmail = validateEmail;
exports.validateEnum = validateEnum;
exports.validateUUID = validateUUID;
exports.validateNumber = validateNumber;
exports.validateBoolean = validateBoolean;
exports.validateArray = validateArray;
exports.validateObject = validateObject;
exports.validateObjectFields = validateObjectFields;
exports.validateApiKey = validateApiKey;
exports.validateSoulId = validateSoulId;
exports.validateAgentName = validateAgentName;
exports.validateTargetSystem = validateTargetSystem;
exports.validatePagination = validatePagination;
exports.validateRequestBody = validateRequestBody;
const errors_js_1 = require("./errors.js");
/**
 * Validate that a value is not empty
 */
function validateRequired(value, fieldName) {
    if (value === null || value === undefined || value === '') {
        throw new errors_js_1.ValidationError(`${fieldName} is required`, {
            field: fieldName,
            value,
        });
    }
}
/**
 * Validate that a value is a string
 */
function validateString(value, fieldName, options) {
    if (typeof value !== 'string') {
        throw new errors_js_1.ValidationError(`${fieldName} must be a string`, {
            field: fieldName,
            value,
            type: typeof value,
        });
    }
    if (options?.minLength && value.length < options.minLength) {
        throw new errors_js_1.ValidationError(`${fieldName} must be at least ${options.minLength} characters`, {
            field: fieldName,
            value,
            minLength: options.minLength,
        });
    }
    if (options?.maxLength && value.length > options.maxLength) {
        throw new errors_js_1.ValidationError(`${fieldName} must be at most ${options.maxLength} characters`, {
            field: fieldName,
            value,
            maxLength: options.maxLength,
        });
    }
}
/**
 * Validate that a value is an email
 */
function validateEmail(value, fieldName = 'email') {
    validateString(value, fieldName);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} must be a valid email address`, {
            field: fieldName,
            value,
        });
    }
}
/**
 * Validate that a value is in a list of allowed values
 */
function validateEnum(value, fieldName, allowedValues) {
    if (!allowedValues.includes(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, {
            field: fieldName,
            value,
            allowedValues,
        });
    }
}
/**
 * Validate that a value is a valid UUID
 */
function validateUUID(value, fieldName) {
    validateString(value, fieldName);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} must be a valid UUID`, {
            field: fieldName,
            value,
        });
    }
}
/**
 * Validate that a value is a number
 */
function validateNumber(value, fieldName, options) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} must be a number`, {
            field: fieldName,
            value,
            type: typeof value,
        });
    }
    if (options?.min !== undefined && value < options.min) {
        throw new errors_js_1.ValidationError(`${fieldName} must be at least ${options.min}`, {
            field: fieldName,
            value,
            min: options.min,
        });
    }
    if (options?.max !== undefined && value > options.max) {
        throw new errors_js_1.ValidationError(`${fieldName} must be at most ${options.max}`, {
            field: fieldName,
            value,
            max: options.max,
        });
    }
}
/**
 * Validate that a value is a boolean
 */
function validateBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
        throw new errors_js_1.ValidationError(`${fieldName} must be a boolean`, {
            field: fieldName,
            value,
            type: typeof value,
        });
    }
}
/**
 * Validate that a value is an array
 */
function validateArray(value, fieldName, options) {
    if (!Array.isArray(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} must be an array`, {
            field: fieldName,
            value,
            type: typeof value,
        });
    }
    if (options?.minLength && value.length < options.minLength) {
        throw new errors_js_1.ValidationError(`${fieldName} must have at least ${options.minLength} items`, {
            field: fieldName,
            value,
            minLength: options.minLength,
        });
    }
    if (options?.maxLength && value.length > options.maxLength) {
        throw new errors_js_1.ValidationError(`${fieldName} must have at most ${options.maxLength} items`, {
            field: fieldName,
            value,
            maxLength: options.maxLength,
        });
    }
}
/**
 * Validate that a value is an object
 */
function validateObject(value, fieldName) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} must be an object`, {
            field: fieldName,
            value,
            type: typeof value,
        });
    }
}
/**
 * Validate that an object has required fields
 */
function validateObjectFields(obj, fieldName, requiredFields) {
    validateObject(obj, fieldName);
    const missingFields = requiredFields.filter(field => !(field in obj));
    if (missingFields.length > 0) {
        throw new errors_js_1.ValidationError(`${fieldName} is missing required fields: ${missingFields.join(', ')}`, {
            field: fieldName,
            missingFields,
        });
    }
}
/**
 * Validate API key format
 */
function validateApiKey(value, fieldName = 'apiKey') {
    validateString(value, fieldName, { minLength: 32 });
    if (!/^[a-zA-Z0-9\-_]+$/.test(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} contains invalid characters`, {
            field: fieldName,
            value,
        });
    }
}
/**
 * Validate soul ID
 */
function validateSoulId(value, fieldName = 'soulId', validSouls) {
    validateString(value, fieldName);
    if (validSouls && !validSouls.includes(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} must be one of: ${validSouls.join(', ')}`, {
            field: fieldName,
            value,
            validSouls,
        });
    }
}
/**
 * Validate agent name
 */
function validateAgentName(value, fieldName = 'agentName') {
    validateString(value, fieldName, { minLength: 1, maxLength: 255 });
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
        throw new errors_js_1.ValidationError(`${fieldName} contains invalid characters`, {
            field: fieldName,
            value,
        });
    }
}
/**
 * Validate target system
 */
function validateTargetSystem(value, fieldName = 'targetSystem') {
    validateEnum(value, fieldName, ['openclaw', 'local', 'cloud']);
}
/**
 * Validate pagination parameters
 */
function validatePagination(page, limit) {
    const validatedPage = page ? Math.max(1, parseInt(page, 10)) : 1;
    const validatedLimit = limit ? Math.max(1, Math.min(100, parseInt(limit, 10))) : 20;
    if (isNaN(validatedPage) || isNaN(validatedLimit)) {
        throw new errors_js_1.ValidationError('Invalid pagination parameters', {
            page: validatedPage,
            limit: validatedLimit,
        });
    }
    return { page: validatedPage, limit: validatedLimit };
}
/**
 * Validate request body
 */
function validateRequestBody(body, requiredFields) {
    if (!body || typeof body !== 'object') {
        throw new errors_js_1.ValidationError('Request body must be a valid JSON object', {
            received: typeof body,
        });
    }
    const missingFields = requiredFields.filter(field => !(field in body));
    if (missingFields.length > 0) {
        throw new errors_js_1.ValidationError(`Missing required fields: ${missingFields.join(', ')}`, {
            missingFields,
            receivedFields: Object.keys(body),
        });
    }
}
exports.default = {
    validateRequired,
    validateString,
    validateEmail,
    validateEnum,
    validateUUID,
    validateNumber,
    validateBoolean,
    validateArray,
    validateObject,
    validateObjectFields,
    validateApiKey,
    validateSoulId,
    validateAgentName,
    validateTargetSystem,
    validatePagination,
    validateRequestBody,
};
