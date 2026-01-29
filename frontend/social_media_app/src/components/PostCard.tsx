import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, CardActions, Divider } from "@mui/material";
import { fetchClient } from "../api/fetchClient";
import { Edit, Delete } from "@mui/icons-material";
import { getCurrentUser } from "../utils/auth";

export default function PostCard({ post }: any) {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const postUserId = post.user && typeof post.user === "object" ? post.user._id : post.user;

    const isAuthor = Boolean(currentUser && postUserId && String(postUserId) === String(currentUser.id));

    const deletePost = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await fetchClient(`/posts/${post._id}`, { method: "DELETE" });
            window.location.reload();
        }
    }

    const formatDate = (date: string) => {
        const postDate = new Date(date);
        return postDate.toLocaleDateString();
    }

    return (
        <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            marginBottom: 2,
            '&:hover': {
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
        }}>
            <CardContent sx={{ pb: 1 }}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                            {post.user?.email ?? "Deleted user"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999', fontSize: 12 }}>
                            {formatDate(post.createdAt)}
                        </Typography>
                    </div>
                </div>
                <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {post.content}
                </Typography>
            </CardContent>

            {isAuthor && (
                <>
                    <Divider sx={{ my: 0.5 }} />
                    <CardActions sx={{ justifyContent: 'flex-end', gap: 1, pt: 1 }}>
                        <Button
                            size="small"
                            onClick={() => navigate(`/edit/${post._id}`)}
                            startIcon={<Edit />}
                            sx={{
                                color: '#667eea',
                                fontWeight: 500,
                                '&:hover': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)'
                                }
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            size="small"
                            onClick={deletePost}
                            startIcon={<Delete />}
                            sx={{
                                color: '#ef5350',
                                fontWeight: 500,
                                '&:hover': {
                                    backgroundColor: 'rgba(239, 83, 80, 0.08)'
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </CardActions>
                </>
            )}

        </Card>
    )
}