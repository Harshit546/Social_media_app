/**
 * Validation Utility Module
 * 
 * Purpose:
 * - Provides a wrapper around ValidatorJS for consistent data validation
 * - Supports custom rules (e.g., password complexity)
 * - Returns structured errors or throws exceptions for controllers
 *
 * Features:
 * 1. validate() – returns ValidationResult with valid flag and errors
 * 2. validateOrThrow() – throws Error with validation errors if invalid
 * 3. Custom rules: uppercase, lowercase, digit, special character
 */

const Validator = require('validatorjs');

// CUSTOM PASSWORD VALIDATION RULES

/** Password must contain at least one uppercase letter */
Validator.register('uppercase', (value: string) => /[A-Z]/.test(value), 'The :attribute must contain at least 1 uppercase letter');

/** Password must contain at least one lowercase letter */
Validator.register('lowercase', (value: string) => /[a-z]/.test(value), 'The :attribute must contain at least 1 lowercase letter');

/** Password must contain at least one digit */
Validator.register('digit', (value: string) => /[0-9]/.test(value), 'The :attribute must contain at least 1 digit');

/** Password must contain at least one special character */
Validator.register('special', (value: string) => /[^A-Za-z0-9]/.test(value), 'The :attribute must contain at least 1 special character');

// TYPE DEFINITIONS

/** Maps field names to an array of error messages */
export interface ValidationError {
    [key: string]: string[];
}

/** Validation operation result */
export interface ValidationResult {
    valid: boolean;              // true if validation passed
    errors: ValidationError;     // object containing field-specific errors
}

// VALIDATION FUNCTIONS

/**
 * Validate data against defined rules
 * @param data - object containing data to validate
 * @param rules - validation rules (e.g., { email: 'required|email' })
 * @param messages - optional custom error messages
 * @returns ValidationResult with valid flag and errors
 */
export const validate = (
    data: Record<string, any>,
    rules: Record<string, string>,
    messages?: Record<string, string>
): ValidationResult => {
    const validator = new Validator(data, rules, messages);

    if (validator.fails()) {
        return {
            valid: false,
            errors: validator.errors.all() as ValidationError
        };
    }

    return {
        valid: true,
        errors: {}
    };
};

/**
 * Validate data and throw an Error if validation fails
 * - Recommended for use in controllers
 * @param data - object to validate
 * @param rules - validation rules
 * @param messages - optional custom messages
 * @throws Error with combined validation messages and validationErrors property
 */
export const validateOrThrow = (
    data: Record<string, any>,
    rules: Record<string, string>,
    messages?: Record<string, string>
): void => {
    const result = validate(data, rules, messages);

    if (!result.valid) {
        const errorMessage = Object.entries(result.errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('; ');

        const error = new Error(errorMessage);
        (error as any).validationErrors = result.errors;  // attach detailed errors
        throw error;
    }
};
