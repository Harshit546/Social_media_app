"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrThrow = exports.validate = void 0;
const Validator = require('validatorjs');
// Custom validation rules for password complexity
Validator.register('uppercase', (value) => {
    return /[A-Z]/.test(value);
}, 'The :attribute must contain at least 1 uppercase letter');
Validator.register('lowercase', (value) => {
    return /[a-z]/.test(value);
}, 'The :attribute must contain at least 1 lowercase letter');
Validator.register('numeric', (value) => {
    return /[0-9]/.test(value);
}, 'The :attribute must contain at least 1 digit');
Validator.register('special', (value) => {
    return /[^A-Za-z0-9]/.test(value);
}, 'The :attribute must contain at least 1 special character');
/**
 * Validate data against defined rules
 * @param data - Data to validate
 * @param rules - Validation rules
 * @param messages - Custom error messages (optional)
 * @returns ValidationResult
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
 * Throws an error if validation fails
 * @param data - Data to validate
 * @param rules - Validation rules
 * @param messages - Custom error messages (optional)
 * @throws Error with validation errors
 */
const validateOrThrow = (data, rules, messages) => {
    const result = (0, exports.validate)(data, rules, messages);
    if (!result.valid) {
        const errorMessage = Object.entries(result.errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('; ');
        const error = new Error(errorMessage);
        error.validationErrors = result.errors;
        throw error;
    }
};
exports.validateOrThrow = validateOrThrow;
