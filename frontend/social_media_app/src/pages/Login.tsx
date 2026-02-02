import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchClient } from "../api/fetchClient";
import {
    Button,
    Card,
    CardContent,
    TextField,
    Container,
    InputAdornment,
    IconButton
} from "@mui/material";
import { useAuthStore } from "../store/auth.store";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Login page component
export default function Login() {

    // State for email input
    const [email, setEmail] = useState("");

    // State for password input
    const [password, setPassword] = useState("");

    // State to show loading state while API request is in progress
    const [loading, setLoading] = useState(false);

    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    // React Router navigation function
    const navigate = useNavigate();

    // Login function from auth store to save user & token globally
    const login = useAuthStore((s) => s.login);

    // State to store validation errors returned from backend
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handles login button click
    const handleSubmit = async () => {
        setLoading(true);   // Start loading
        setErrors({});      // Clear previous errors

        try {
            // Call backend login API
            const res = await fetchClient("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            // Save user data & token in global auth store
            login(res.data.user, res.data.token);

            // Redirect user to feed page after successful login
            navigate("/feed", { replace: true });
        }
        catch (err: any) {
            // Handle backend validation errors (422)
            if (err.statusCode === 422 && err.errors) {
                const fieldErrors: Record<string, string> = {};

                // Convert backend error format to UI-friendly format
                Object.entries(err.errors).forEach(([field, messages]: any) => {
                    fieldErrors[field] = messages[0]; // show first error
                });

                setErrors(fieldErrors);
            } else {
                // Generic error fallback
                alert(err.message || "Something went wrong");
            }
        }
        finally {
            // Stop loading regardless of success or failure
            setLoading(false);
        }
    };

    return (
        // Full screen gradient background
        <div className="flex items-center justify-center p-5 min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">

            {/* Centered container */}
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    <CardContent sx={{ p: 4 }}>

                        {/* Header section */}
                        <div className="text-center mb-8">
                            <h1 className="text-[32px] font-[700] text-[#333] mb-8">
                                Welcome Back
                            </h1>
                            <p className="text-[#666] text-[14px]">
                                Sign in to your account
                            </p>
                        </div>

                        {/* Login form */}
                        <div className="flex flex-col gap-6">

                            {/* Email input */}
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
                                value={email}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '& fieldset': { borderColor: '#e0e0e0' },
                                        '&:hover fieldset': { borderColor: '#667eea' },
                                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                    }
                                }}
                            />

                            {/* Password input with visibility toggle */}
                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={password}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{
                                                    color: '#667eea',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(102, 126, 234, 0.08)'
                                                    }
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '& fieldset': { borderColor: '#e0e0e0' },
                                        '&:hover fieldset': { borderColor: '#667eea' },
                                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                    }
                                }}
                            />

                            {/* Login button */}
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                    padding: '12px',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </div>

                        {/* Register redirect */}
                        <div className="text-center mt-8">
                            <p className="text-[#666] text-[14px]">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#667eea] font-[600]">
                                    Register here
                                </Link>
                            </p>
                        </div>

                    </CardContent>
                </Card>
            </Container>
        </div>
    );
}
