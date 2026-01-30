"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginMessages = exports.registerMessages = exports.loginRules = exports.registerRules = void 0;
exports.registerRules = {
    email: 'required|email',
    password: 'required|min:8|max:32|uppercase|lowercase|numeric|special'
};
exports.loginRules = {
    email: 'required|email',
    password: 'required|min:8'
};
exports.registerMessages = {
    'email.required': 'Email is required',
    'email.email': 'Invalid email',
    'password.required': 'Password is required',
    'password.min': 'Password must be at least 8 characters',
    'password.max': 'Password must be at most 32 characters',
    'password.uppercase': 'Password must contain 1 uppercase letter',
    'password.lowercase': 'Password must contain 1 lowercase letter',
    'password.numeric': 'Password must contain 1 digit',
    'password.special': 'Password must contain 1 special character'
};
exports.loginMessages = {
    'email.required': 'Email is required',
    'email.email': 'Invalid email',
    'password.required': 'Password is required',
    'password.min': 'Password must be at least 8 characters'
};
