import { useState } from "react";
import { fetchClient } from "../api/fetchClient";
import { Button, TextField, Card, CardContent } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function PostForm({ onPostCreated }: any) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const submitPost = async () => {
        if (!content.trim()) {
            return;
        }

        setLoading(true);
        try {
            await fetchClient("/posts", {
                method: "POST",
                body: JSON.stringify({ content })
            })
            setContent("");
            onPostCreated();
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            marginBottom: 3,
        }}>
            <CardContent sx={{ p: 3 }}>
                <div className="flex flex-col gap-4">
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8f9fa',
                                '& fieldset': { borderColor: '#e0e0e0' },
                                '&:hover fieldset': { borderColor: '#667eea' },
                                '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={submitPost}
                        disabled={loading || !content.trim()}
                        endIcon={<SendIcon />}
                        sx={{
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            padding: '10px 24px',
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: 15,
                            '&:hover': {
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? 'Posting...' : 'Share Post'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}