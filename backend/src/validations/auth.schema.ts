export const registerRules = {
    email: 'required|email|string',
    password: 'required|string|min:8|max:32|uppercase|lowercase|digit|special'
};

export const loginRules = {
    email: 'required|email|string',
    password: 'required|string|min:8'
};

export const registerMessages = {
    'email.required': 'Email is required',
    'email.email': 'Invalid email',
    'password.required': 'Password is required',
    'password.min': 'Password must be at least 8 characters',
    'password.max': 'Password must be at most 32 characters',
    'password.uppercase': 'Password must contain 1 uppercase letter',
    'password.lowercase': 'Password must contain 1 lowercase letter',
    'password.digit': 'Password must contain 1 digit',
    'password.special': 'Password must contain 1 special character'
};

export const loginMessages = {
    'email.required': 'Email is required',
    'email.email': 'Invalid email',
    'password.required': 'Password is required',
    'password.min': 'Password must be at least 8 characters'
};