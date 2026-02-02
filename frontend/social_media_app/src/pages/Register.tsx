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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuthStore } from "../store/auth.store";

// Registration page component
export default function Register() {

    // State for email input
    const [email, setEmail] = useState("");

    // State for password input
    const [password, setPassword] = useState("");

    // State to disable button and show loading text
    const [loading, setLoading] = useState(false);

    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    // React Router navigation function
    const navigate = useNavigate();

    // Login method from auth store 
    const login = useAuthStore((s) => s.login);

    // State to store field-level validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handles register button click
    const handleSubmit = async () => {
        setLoading(true);      // Start loading
        setErrors({});         // Reset previous errors

        try {
            // Call backend register API
            await fetchClient("/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            // Redirect user to login page after successful registration
            navigate("/login", { replace: true });

        } catch (err: any) {
            // Handle backend validation errors (422 Unprocessable Entity)
            if (err.statusCode === 422 && err.errors) {
                const fieldErrors: Record<string, string> = {};

                // Convert backend error format to UI-friendly format
                Object.entries(err.errors).forEach(([field, messages]: any) => {
                    fieldErrors[field] = messages[0]; // show first error only
                });

                setErrors(fieldErrors);
            } else {
                // Generic error fallback
                alert(err.message || "Something went wrong");
            }
        } finally {
            // Stop loading regardless of success or failure
            setLoading(false);
        }
    };

    return (
        // Full screen gradient background
        <div className="flex items-center justify-center p-5 min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">

            {/* Container to center the card */}
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        overflow: 'hidden',
                        background: 'white'
                    }}
                >
                    <CardContent sx={{ p: 4 }}>

                        {/* Header section */}
                        <div className="text-center mb-8">
                            <h1 className="text-[32px] font-[700] text-[#333] mb-8">
                                Join Us
                            </h1>
                            <p className="text-[#666] text-[14px]">
                                Create a new account to get started
                            </p>
                        </div>

                        {/* Form fields */}
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

                            {/* Submit button */}
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
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </div>

                        {/* Login redirect */}
                        <div className="text-center mt-8">
                            <p className="text-[#666] text-[14px]">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#667eea] font-[600]">
                                    Login here
                                </Link>
                            </p>
                        </div>

                    </CardContent>
                </Card>
            </Container>
        </div>
    );
}
