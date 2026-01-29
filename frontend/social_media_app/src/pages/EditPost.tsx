import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchClient } from "../api/fetchClient";
import { Button, Card, CardContent, TextField, Container } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const updatePost = async () => {
        if (!content.trim()) {
            return;
        }

        setLoading(true);
        try {
            await fetchClient(`/posts/${id}`, {
                method: "PUT",
                body: JSON.stringify({ content })
            })
            navigate("/");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Container maxWidth="sm">
                <Card sx={{
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <div className="text-center mb-8">
                            <h1 className="text-[28px] font-[700] text-[#333] mb-2">Edit Post</h1>
                            <p className="text-[14px] text-[#666]">Update your post content</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                label="Post Content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '& fieldset': { borderColor: '#e0e0e0' },
                                        '&:hover fieldset': { borderColor: '#667eea' },
                                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                    }
                                }}
                            />
                            <div className="flex gap-3">
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => navigate("/")}
                                    startIcon={<ArrowBackIcon />}
                                    sx={{
                                        color: '#667eea',
                                        borderColor: '#667eea',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                            borderColor: '#667eea'
                                        }
                                    }}>
                                    Cancel
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={updatePost}
                                    disabled={loading || !content.trim()}
                                    sx={{
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </div >
    )
}