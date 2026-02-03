"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrThrow = exports.validate = void 0;
const Validator = require('validatorjs');
// CUSTOM PASSWORD VALIDATION RULES
/** Password must contain at least one uppercase letter */
Validator.register('uppercase', (value) => /[A-Z]/.test(value), 'The :attribute must contain at least 1 uppercase letter');
/** Password must contain at least one lowercase letter */
Validator.register('lowercase', (value) => /[a-z]/.test(value), 'The :attribute must contain at least 1 lowercase letter');
/** Password must contain at least one digit */
Validator.register('digit', (value) => /[0-9]/.test(value), 'The :attribute must contain at least 1 digit');
/** Password must contain at least one special character */
Validator.register('special', (value) => /[^A-Za-z0-9]/.test(value), 'The :attribute must contain at least 1 special character');
// VALIDATION FUNCTIONS
/**
 * Validate data against defined rules
 * @param data - object containing data to validate
 * @param rules - validation rules (e.g., { email: 'required|email' })
 * @param messages - optional custom error messages
 * @returns ValidationResult with valid flag and errors
 */
const validate = (data, rules, messages) => {
    const validator = new Validator(data, rules, messages);
    if (validator.fails()) {
        return {
            valid: false,
            errors: validator.errors.all()
        };
    }
    return {
        valid: true,
        errors: {}
    };
};
exports.validate = validate;
/**
 * Validate data and throw an Error if validation fails
 * - Recommended for use in controllers
 * @param data - object to validate
 * @param rules - validation rules
 * @param messages - optional custom messages
 * @throws Error with combined validation messages and validationErrors property
 */
const validateOrThrow = (data, rules, messages) => {
    const result = (0, exports.validate)(data, rules, messages);
    if (!result.valid) {
        const errorMessage = Object.entries(result.errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('; ');
        const error = new Error(errorMessage);
        error.validationErrors = result.errors; // attach detailed errors
        throw error;
    }
};
exports.validateOrThrow = validateOrThrow;
