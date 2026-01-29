import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { AppBar, Button, Toolbar, Container } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar() {
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <AppBar position="static" sx={{
            background: 'linear-gradient(90deg, #1b42f0ff 0%, rgba(89, 6, 172, 1) 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}>
            <Container maxWidth="lg">
                <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
                    <span className="font-bold text-xl text-white">Social App</span>
                    <Button 
                        color="inherit" 
                        onClick={handleLogout}
                        endIcon={<LogoutIcon />}
                        sx={{
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                transform: 'scale(1.05)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    )
}