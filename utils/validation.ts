/**
 * Input validation utilities for ClawNexus
 * Provides validation functions for common data types and formats
 */

import { ValidationError } from './errors.js';

/**
 * Validate that a value is not empty
 */
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`, {
      field: fieldName,
      value,
    });
  }
}

/**
 * Validate that a value is a string
 */
export function validateString(value: any, fieldName: string, options?: { minLength?: number; maxLength?: number }): void {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, {
      field: fieldName,
      value,
      type: typeof value,
    });
  }

  if (options?.minLength && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must be at least ${options.minLength} characters`, {
      field: fieldName,
      value,
      minLength: options.minLength,
    });
  }

  if (options?.maxLength && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${options.maxLength} characters`, {
      field: fieldName,
      value,
      maxLength: options.maxLength,
    });
  }
}

/**
 * Validate that a value is an email
 */
export function validateEmail(value: any, fieldName: string = 'email'): void {
  validateString(value, fieldName);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid email address`, {
      field: fieldName,
      value,
    });
  }
}

/**
 * Validate that a value is in a list of allowed values
 */
export function validateEnum(value: any, fieldName: string, allowedValues: string[]): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, {
      field: fieldName,
      value,
      allowedValues,
    });
  }
}

/**
 * Validate that a value is a valid UUID
 */
export function validateUUID(value: any, fieldName: string): void {
  validateString(value, fieldName);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`, {
      field: fieldName,
      value,
    });
  }
}

/**
 * Validate that a value is a number
 */
export function validateNumber(value: any, fieldName: string, options?: { min?: number; max?: number }): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, {
      field: fieldName,
      value,
      type: typeof value,
    });
  }

  if (options?.min !== undefined && value < options.min) {
    throw new ValidationError(`${fieldName} must be at least ${options.min}`, {
      field: fieldName,
      value,
      min: options.min,
    });
  }

  if (options?.max !== undefined && value > options.max) {
    throw new ValidationError(`${fieldName} must be at most ${options.max}`, {
      field: fieldName,
      value,
      max: options.max,
    });
  }
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: any, fieldName: string): void {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`, {
      field: fieldName,
      value,
      type: typeof value,
    });
  }
}

/**
 * Validate that a value is an array
 */
export function validateArray(value: any, fieldName: string, options?: { minLength?: number; maxLength?: number }): void {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, {
      field: fieldName,
      value,
      type: typeof value,
    });
  }

  if (options?.minLength && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must have at least ${options.minLength} items`, {
      field: fieldName,
      value,
      minLength: options.minLength,
    });
  }

  if (options?.maxLength && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${options.maxLength} items`, {
      field: fieldName,
      value,
      maxLength: options.maxLength,
    });
  }
}

/**
 * Validate that a value is an object
 */
export function validateObject(value: any, fieldName: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`, {
      field: fieldName,
      value,
      type: typeof value,
    });
  }
}

/**
 * Validate that an object has required fields
 */
export function validateObjectFields(obj: any, fieldName: string, requiredFields: string[]): void {
  validateObject(obj, fieldName);

  const missingFields = requiredFields.filter(field => !(field in obj));
  if (missingFields.length > 0) {
    throw new ValidationError(`${fieldName} is missing required fields: ${missingFields.join(', ')}`, {
      field: fieldName,
      missingFields,
    });
  }
}

/**
 * Validate API key format
 */
export function validateApiKey(value: any, fieldName: string = 'apiKey'): void {
  validateString(value, fieldName, { minLength: 32 });

  if (!/^[a-zA-Z0-9\-_]+$/.test(value)) {
    throw new ValidationError(`${fieldName} contains invalid characters`, {
      field: fieldName,
      value,
    });
  }
}

/**
 * Validate soul ID
 */
export function validateSoulId(value: any, fieldName: string = 'soulId', validSouls?: string[]): void {
  validateString(value, fieldName);

  if (validSouls && !validSouls.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${validSouls.join(', ')}`, {
      field: fieldName,
      value,
      validSouls,
    });
  }
}

/**
 * Validate agent name
 */
export function validateAgentName(value: any, fieldName: string = 'agentName'): void {
  validateString(value, fieldName, { minLength: 1, maxLength: 255 });

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
    throw new ValidationError(`${fieldName} contains invalid characters`, {
      field: fieldName,
      value,
    });
  }
}

/**
 * Validate target system
 */
export function validateTargetSystem(value: any, fieldName: string = 'targetSystem'): void {
  validateEnum(value, fieldName, ['openclaw', 'local', 'cloud']);
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: any, limit?: any): { page: number; limit: number } {
  const validatedPage = page ? Math.max(1, parseInt(page, 10)) : 1;
  const validatedLimit = limit ? Math.max(1, Math.min(100, parseInt(limit, 10))) : 20;

  if (isNaN(validatedPage) || isNaN(validatedLimit)) {
    throw new ValidationError('Invalid pagination parameters', {
      page: validatedPage,
      limit: validatedLimit,
    });
  }

  return { page: validatedPage, limit: validatedLimit };
}

/**
 * Validate request body
 */
export function validateRequestBody(body: any, requiredFields: string[]): void {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a valid JSON object', {
      received: typeof body,
    });
  }

  const missingFields = requiredFields.filter(field => !(field in body));
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`, {
      missingFields,
      receivedFields: Object.keys(body),
    });
  }
}

export default {
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
