import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    Typography,
    Button,
    CardActions,
    Divider,
    IconButton,
    TextField,
    Avatar,
    Box
} from "@mui/material";
import { fetchClient } from "../api/fetchClient";
import { Edit, Delete, Favorite, Comment as CommentIcon } from "@mui/icons-material";
import { getCurrentUser } from "../utils/auth";

export default function PostCard({ post: initialPost }: any) {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const [post, setPost] = useState<any>(initialPost);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingComment, setLoadingComment] = useState(false);

    const postUserId = post.user && typeof post.user === "object" ? post.user._id : post.user;
    const isAuthor = Boolean(currentUser && postUserId && String(postUserId) === String(currentUser.id));
    const likesCount = post.likesCount ?? post.likes?.length ?? 0;
    const commentsCount = post.commentsCount ?? post.comments?.length ?? 0;
    const likedByCurrentUser = Boolean(
        currentUser && (post.likes?.some ? post.likes.some((l: any) => String(l) === String(currentUser.id)) : false)
    );

    const deletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            await fetchClient(`/posts/${post._id}`, { method: "DELETE" });
            if (props.onDelete) props.onDelete(post._id);
            window.location.reload();
        }
    };

    const formatDate = (date: string) => {
        const postDate = new Date(date);
        return postDate.toLocaleDateString();
    };

    const normalizeResponsePost = (res: any) => {
        // backend may return post in different shapes: res, res.data, res.post
        return res?.data ?? res?.post ?? res;
    };

    const toggleLike = async () => {
        if (!currentUser) {
            alert("Please login to like posts");
            return;
        }
        setLoadingLike(true);
        try {
            const res = await fetchClient(`/posts/${post._id}/like`, { method: "PATCH" });
            const updated = normalizeResponsePost(res);
            if (updated) setPost(updated);
        } catch (err: any) {
            alert(err?.message || "Failed to toggle like");
        } finally {
            setLoadingLike(false);
        }
    };

    const submitComment = async () => {
        if (!currentUser) return alert("Please login to comment");
        const content = commentText.trim();
        if (!content) return;

        setLoadingComment(true);
        try {
            const res = await fetchClient(`/posts/${post._id}/comments`, {
                method: "POST",
                body: JSON.stringify({ content })
            });
            const updated = res.post ?? res.data?.post ?? normalizeResponsePost(res);
            if (updated) setPost(updated);
            setCommentText("");
            setShowComments(true);
        } catch (err: any) {
            alert(err?.message || "Failed to add comment");
        } finally {
            setLoadingComment(false);
        }
    };


    const deleteComment = async (commentId: string) => {
        if (!currentUser) {
            alert("Please login");
            return;
        }
        if (!window.confirm("Delete this comment?")) return;
        try {
            const res = await fetchClient(`/posts/${post._id}/comments/${commentId}`, { method: "DELETE" });
            const updated = res?.data ?? res ?? res?.post;
            if (updated && updated.comments) {
                setPost(updated);
            } else {
                // fallback: remove locally
                setPost((p: any) => {
                    const newComments = (p.comments ?? []).filter((c: any) => String(c._id) !== String(commentId));
                    return { ...p, comments: newComments, commentsCount: newComments.length };
                });
            }
        } catch (err: any) {
            alert(err?.message || "Failed to delete comment");
        }
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                marginBottom: 2,
                "&:hover": {
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                    transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                <div className="flex items-center justify-between mb-3">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Avatar sx={{ width: 36, height: 36 }}>{String(post.user?.email ?? "U")[0].toUpperCase()}</Avatar>
                        <div>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#333" }}>
                                {post.user?.email ?? "Deleted user"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#999", fontSize: 12 }}>
                                {formatDate(post.createdAt)}
                            </Typography>
                        </div>
                    </div>
                    <div>
                        {isAuthor && (
                            <>
                                <Button
                                    size="small"
                                    onClick={() => navigate(`/edit/${post._id}`)}
                                    startIcon={<Edit />}
                                    sx={{
                                        color: "#667eea",
                                        fontWeight: 500,
                                        mr: 1,
                                        "&:hover": { backgroundColor: "rgba(102, 126, 234, 0.04)" }
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    onClick={deletePost}
                                    startIcon={<Delete />}
                                    sx={{
                                        color: "#ef5350",
                                        fontWeight: 500,
                                        "&:hover": { backgroundColor: "rgba(239, 83, 80, 0.04)" }
                                    }}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <Typography
                    variant="body1"
                    sx={{ color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                    {post.content}
                </Typography>
            </CardContent>

            <Divider sx={{ my: 0.5 }} />

            <CardActions sx={{ justifyContent: "space-between", alignItems: "center", px: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={toggleLike} disabled={loadingLike} color={likedByCurrentUser ? "error" : "default"}>
                        <Favorite />
                    </IconButton>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                        {likesCount}
                    </Typography>

                    <IconButton onClick={() => setShowComments(s => !s)} sx={{ ml: 2 }}>
                        <CommentIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                        {commentsCount}
                    </Typography>
                </Box>
            </CardActions>

            {showComments && (
                <>
                    <Divider />
                    <CardContent sx={{ pt: 1 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        submitComment();
                                    }
                                }}
                            />
                            <Button variant="contained" onClick={submitComment} disabled={loadingComment || !commentText.trim()}>
                                Comment
                            </Button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {(post.comments ?? []).length === 0 ? (
                                <Typography variant="body2" sx={{ color: "#999" }}>
                                    No comments yet
                                </Typography>
                            ) : (
                                (post.comments ?? []).map((c: any) => {
                                    const commentUserEmail = c.user && typeof c.user === "object" ? c.user.email : c.user;
                                    const canDelete =
                                        currentUser &&
                                        (String(c.user?._id ?? c.user) === String(currentUser.id) ||
                                            String(postUserId) === String(currentUser.id));
                                    return (
                                        <Box key={c._id || c.createdAt} sx={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                {String(commentUserEmail ?? "U")[0].toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontSize: 13 }}>
                                                    {commentUserEmail ?? "Deleted user"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#333" }}>
                                                    {c.content}
                                                </Typography>
                                            </Box>
                                            {canDelete && (
                                                <Button size="small" onClick={() => deleteComment(c._id)} sx={{ color: "#ef5350" }}>
                                                    Delete
                                                </Button>
                                            )}
                                        </Box>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}