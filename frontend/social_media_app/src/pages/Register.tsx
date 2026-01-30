import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchClient } from "../api/fetchClient";
import { Button, Card, CardContent, TextField, Container, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuthStore } from "../store/auth.store";
// import { registerSchema } from "../validations/auth.schema";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});

        try {
            await fetchClient("/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            navigate("/");
        } catch (err: any) {
            if (err.statusCode === 422 && err.errors) {
                const fieldErrors: Record<string, string> = {};

                Object.entries(err.errors).forEach(([field, messages]: any) => {
                    fieldErrors[field] = messages[0]; // show first error
                });

                setErrors(fieldErrors);
            } else {
                alert(err.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center p-5 min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <Container maxWidth="sm">
                <Card sx={{
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden',
                    background: 'white'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <div className="text-center mb-8">
                            <h1 className="text-[32px] font-[700] text-[#333] mb-8">Join Us</h1>
                            <p className="text-[#666] text-[14px]">Create a new account to get started</p>
                        </div>
                        <div className="flex flex-col gap-6">
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
    )
}