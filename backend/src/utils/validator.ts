const Validator = require('validatorjs');

// Custom validation rules for password complexity
Validator.register('uppercase', (value: string) => {
    return /[A-Z]/.test(value);
}, 'The :attribute must contain at least 1 uppercase letter');

Validator.register('lowercase', (value: string) => {
    return /[a-z]/.test(value);
}, 'The :attribute must contain at least 1 lowercase letter');

Validator.register('digit', (value: string) => {
    return /[0-9]/.test(value);
}, 'The :attribute must contain at least 1 digit');

Validator.register('special', (value: string) => {
    return /[^A-Za-z0-9]/.test(value);
}, 'The :attribute must contain at least 1 special character');

export interface ValidationError {
    [key: string]: string[];
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError;
}

/**
 * Validate data against defined rules
 * @param data - Data to validate
 * @param rules - Validation rules
 * @param messages - Custom error messages (optional)
 * @returns ValidationResult
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
 * Throws an error if validation fails
 * @param data - Data to validate
 * @param rules - Validation rules
 * @param messages - Custom error messages (optional)
 * @throws Error with validation errors
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
        (error as any).validationErrors = result.errors;
        throw error;
    }
};
