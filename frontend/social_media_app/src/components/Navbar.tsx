import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import {
    AppBar,
    Button,
    Toolbar,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchClient } from "../api/fetchClient";

/**
 * Navbar
 * Top navigation bar for authenticated users.
 *
 * Responsibilities:
 * - Display application branding
 * - Handle user logout
 * - Handle account deletion with confirmation dialog
 *
 * This component assumes the user is already authenticated.
 */
export default function Navbar() {
    /**
     * Auth store actions
     */
    const logout = useAuthStore((state) => state.logout);

    /**
     * Router navigation utility
     */
    const navigate = useNavigate();

    /**
     * UI state for delete confirmation dialog
     */
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    /**
     * Loading state for account deletion
     * Used to disable buttons and prevent duplicate requests
     */
    const [deletingAccount, setDeletingAccount] = useState(false);

    /**
     * Logs the user out locally and redirects to login page
     */
    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    /**
     * Opens the delete account confirmation dialog
     */
    const handleDeleteAccountClick = () => {
        setOpenDeleteDialog(true);
    };

    /**
     * Confirms account deletion
     * - Calls backend API to delete the current user's account
     * - Logs the user out
     * - Redirects to login page
     */
    const handleDeleteAccountConfirm = async () => {
        setDeletingAccount(true);
        try {
            await fetchClient("/users/me", { method: "DELETE" });

            // Clear local auth state after successful deletion
            logout();

            // Close dialog and redirect
            setOpenDeleteDialog(false);
            navigate("/login", { replace: true });
        } catch (err: any) {
            alert(err?.message || "Failed to delete account");
            setDeletingAccount(false);
        }
    };

    /**
     * Cancels account deletion and closes dialog
     */
    const handleDeleteAccountCancel = () => {
        setOpenDeleteDialog(false);
    };

    return (
        <>
            {/* Top App Bar */}
            <AppBar
                position="static"
                sx={{
                    background:
                        "linear-gradient(90deg, #1b42f0ff 0%, rgba(89, 6, 172, 1) 100%)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: "space-between", py: 2 }}>
                        {/* App Title / Branding */}
                        <span className="font-bold text-xl text-white">
                            Social App
                        </span>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Button
                                color="inherit"
                                onClick={handleDeleteAccountClick}
                                startIcon={<DeleteIcon />}
                                sx={{
                                    fontWeight: 600,
                                    color: "#ffcdd2",
                                    "&:hover": { backgroundColor: "rgba(255,77,77,0.2)", transform: "scale(1.05)" },
                                    transition: "all 0.3s ease",
                                }}
                            >
                                Delete Account
                            </Button>

                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                endIcon={<LogoutIcon />}
                                sx={{
                                    fontWeight: 600,
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)", transform: "scale(1.05)" },
                                    transition: "all 0.3s ease",
                                }}
                            >
                                Logout
                            </Button>
                        </div>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleDeleteAccountCancel}
                aria-labelledby="delete-account-dialog-title"
                aria-describedby="delete-account-dialog-description"
            >
                <DialogTitle
                    id="delete-account-dialog-title"
                    sx={{ fontWeight: 600 }}
                >
                    Delete Account?
                </DialogTitle>

                <DialogContent>
                    <DialogContentText
                        id="delete-account-dialog-description"
                        sx={{ color: "#666" }}
                    >
                        Are you sure you want to delete your account? This action cannot be
                        undone. All your data will be permanently removed.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={handleDeleteAccountCancel}
                        disabled={deletingAccount}
                        variant="outlined"
                        sx={{
                            color: "#667eea",
                            borderColor: "#667eea",
                            "&:hover": {
                                backgroundColor: "rgba(102, 126, 234, 0.04)",
                            },
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleDeleteAccountConfirm}
                        disabled={deletingAccount}
                        variant="contained"
                        sx={{
                            background: "#f44336",
                            "&:hover": {
                                background: "#da190b",
                            },
                        }}
                    >
                        {deletingAccount ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
