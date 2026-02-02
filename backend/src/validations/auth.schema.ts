/**
 * Authentication Validation Schemas
 *
 * Purpose:
 * - Define validation rules for authentication-related endpoints
 * - Provide user-friendly error messages
 * - Enforce strong password policies for security
 *
 * Endpoints Covered:
 * 1. User Registration (/api/auth/register)
 * 2. User Login (/api/auth/login)
 *
 * Notes:
 * - Custom rules like uppercase, lowercase, digit, special ensure strong passwords
 * - Messages are mapped to specific validation failures for clarity
 */

// REGISTRATION VALIDATION

export const registerRules = {
    email: 'required|email|string', // Must be valid email
    // Password requirements:
    // - 8 to 32 characters
    // - At least 1 uppercase letter
    // - At least 1 lowercase letter
    // - At least 1 digit
    // - At least 1 special character
    password: 'required|string|min:8|max:32|uppercase|lowercase|digit|special'
};

// Custom error messages for registration validation
export const registerMessages = {
    'email.required': 'Email is required',
    'email.email': 'Invalid email format',
    'password.required': 'Password is required',
    'password.min': 'Password must be at least 8 characters',
    'password.max': 'Password must be at most 32 characters',
    'password.uppercase': 'Password must contain at least 1 uppercase letter',
    'password.lowercase': 'Password must contain at least 1 lowercase letter',
    'password.digit': 'Password must contain at least 1 digit',
    'password.special': 'Password must contain at least 1 special character'
};

// LOGIN VALIDATION

export const loginRules = {
    email: 'required|email|string', // Must be valid email
    password: 'required|string|min:8' // Password minimum length enforced
};

// Custom error messages for login validation
export const loginMessages = {
    'email.required': 'Email is required',
    'email.email': 'Invalid email format',
    'password.required': 'Password is required',
    'password.min': 'Password must be at least 8 characters'
};
