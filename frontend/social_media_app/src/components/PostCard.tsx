/**
 * PostCard Component
 *
 * Responsible for rendering a single post in the feed.
 * Handles:
 * - Displaying post content, author info, and thumbnail
 * - Like / Unlike functionality
 * - Comment creation & deletion
 * - Post deletion (author only)
 *
 * This component is intentionally stateful because:
 * - Likes & comments update frequently
 * - Backend may return updated post shapes
 */

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
import { fetchClient, API_BASE } from "../api/fetchClient";
import { Edit, Delete, Favorite, Comment as CommentIcon } from "@mui/icons-material";
import { getCurrentUser } from "../utils/auth";

export default function PostCard({ post: initialPost }: any) {
    const navigate = useNavigate();

    // Currently logged-in user (decoded from JWT)
    const currentUser = getCurrentUser();

    /**
     * Local post state
     * Maintained locally so UI updates immediately after likes, comments, or deletions.
     */
    const [post, setPost] = useState<any>(initialPost);

    // UI state
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");

    // Loading flags to prevent double actions
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingComment, setLoadingComment] = useState(false);

    /**
     * Normalize post user ID
     * 
     * Backend may return:
     * - populated user object
     * - raw user ID
     */
    const postUserId =
        post.user && typeof post.user === "object"
            ? post.user._id
            : post.user;

    /**
     * Authorization checks
     */
    const isAuthor =
        Boolean(
            currentUser &&
            postUserId &&
            String(postUserId) === String(currentUser.id)
        );

    /**
     * Derived values
     * 
     * Prefer backend-calculated counts when available.
     */
    const likesCount = post.likesCount ?? post.likes?.length ?? 0;
    const commentsCount = post.commentsCount ?? post.comments?.length ?? 0;

    /**
     * Check if current user liked the post
     */
    const likedByCurrentUser = Boolean(
        currentUser &&
        post.likes?.some?.((l: any) => String(l) === String(currentUser.id))
    );

    /**
     * Delete post (author only)
     */
    const deletePost = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        await fetchClient(`/posts/${post._id}`, { method: "DELETE" });

        // Hard reload used as a fallback for feed refresh
        window.location.reload();
    };

    /**
     * Format post creation date
     */
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    /**
     * Normalize backend responses
     * 
     * Supports multiple backend response shapes:
     * - res
     * - res.data
     * - res.post
     */
    const normalizeResponsePost = (res: any) => {
        return res?.data ?? res?.post ?? res;
    };

    /**
     * Like / Unlike toggle
     */
    const toggleLike = async () => {
        if (!currentUser) {
            alert("Please login to like posts");
            return;
        }

        setLoadingLike(true);
        try {
            const res = await fetchClient(`/posts/${post._id}/like`, {
                method: "PATCH"
            });

            const updatedPost = normalizeResponsePost(res);
            if (updatedPost) setPost(updatedPost);
        } catch (err: any) {
            alert(err?.message || "Failed to toggle like");
        } finally {
            setLoadingLike(false);
        }
    };

    /**
     * Submit new comment
     */
    const submitComment = async () => {
        if (!currentUser) {
            alert("Please login to comment");
            return;
        }

        const content = commentText.trim();
        if (!content) return;

        setLoadingComment(true);
        try {
            const res = await fetchClient(`/posts/${post._id}/comments`, {
                method: "POST",
                body: JSON.stringify({ content })
            });

            const updatedPost = normalizeResponsePost(res);
            if (updatedPost) setPost(updatedPost);

            setCommentText("");
            setShowComments(true);
        } catch (err: any) {
            alert(err?.message || "Failed to add comment");
        } finally {
            setLoadingComment(false);
        }
    };

    /**
     * Delete a comment
     * 
     * Allowed if:
     * - Comment author OR post author
     */
    const deleteComment = async (commentId: string) => {
        if (!currentUser) {
            alert("Please login");
            return;
        }

        if (!window.confirm("Delete this comment?")) return;

        try {
            const res = await fetchClient(
                `/posts/${post._id}/comments/${commentId}`,
                { method: "DELETE" }
            );

            const updatedPost = normalizeResponsePost(res);

            if (updatedPost?.comments) {
                setPost(updatedPost);
            } else {
                // Fallback: optimistic local removal
                setPost((p: any) => {
                    const newComments = (p.comments ?? []).filter(
                        (c: any) => String(c._id) !== String(commentId)
                    );
                    return {
                        ...p,
                        comments: newComments,
                        commentsCount: newComments.length
                    };
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
                transition: "all 0.3s ease",
                "&:hover": {
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                    transform: "translateY(-2px)"
                }
            }}
        >
            {/* Post header */}
            <CardContent sx={{ pb: 1 }}>
                <div className="flex items-center justify-between mb-3">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Avatar sx={{ width: 36, height: 36 }}>
                            {String(post.user?.email ?? "U")[0].toUpperCase()}
                        </Avatar>

                        <div>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {post.user?.email ?? "Deleted user"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#999" }}>
                                {formatDate(post.createdAt)}
                            </Typography>
                        </div>
                    </div>

                    {isAuthor && (
                        <>
                            <Button
                                size="small"
                                onClick={() => navigate(`/edit/${post._id}`)}
                                startIcon={<Edit />}
                            >
                                Edit
                            </Button>
                            <Button
                                size="small"
                                onClick={deletePost}
                                startIcon={<Delete />}
                                color="error"
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </div>

                {/* Post content */}
                <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                    {post.content}
                </Typography>

                {/* Thumbnail image */}
                {post.thumbnail && (
                    <Box sx={{ mt: 2 }}>
                        <img
                            src={
                                post.thumbnail.startsWith("http")
                                    ? post.thumbnail
                                    : `${API_BASE}/uploads/${post.thumbnail}`
                            }
                            alt="Post thumbnail"
                            style={{ maxWidth: "100%", borderRadius: 8 }}
                        />
                    </Box>
                )}
            </CardContent>

            <Divider />

            {/* Like & comment actions */}
            <CardActions sx={{ justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                        onClick={toggleLike}
                        disabled={loadingLike}
                        color={likedByCurrentUser ? "error" : "default"}
                    >
                        <Favorite />
                    </IconButton>
                    <Typography>{likesCount}</Typography>

                    <IconButton onClick={() => setShowComments(v => !v)}>
                        <CommentIcon />
                    </IconButton>
                    <Typography>{commentsCount}</Typography>
                </Box>
            </CardActions>

            {/* Comments section */}
            {showComments && (
                <>
                    <Divider />
                    <CardContent>
                        <div style={{ display: "flex", gap: 8 }}>
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
                            <Button
                                variant="contained"
                                onClick={submitComment}
                                disabled={loadingComment}
                            >
                                Comment
                            </Button>
                        </div>

                        <Box sx={{ mt: 2 }}>
                            {(post.comments ?? []).map((c: any) => {
                                const commentUserEmail =
                                    typeof c.user === "object"
                                        ? c.user.email
                                        : c.user;

                                const canDelete =
                                    currentUser &&
                                    (String(c.user?._id ?? c.user) === String(currentUser.id) ||
                                        String(postUserId) === String(currentUser.id));

                                return (
                                    <Box
                                        key={c._id}
                                        sx={{ display: "flex", gap: 12, mb: 1 }}
                                    >
                                        <Avatar sx={{ width: 32, height: 32 }}>
                                            {String(commentUserEmail ?? "U")[0].toUpperCase()}
                                        </Avatar>

                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2">
                                                {commentUserEmail ?? "Deleted user"}
                                            </Typography>
                                            <Typography variant="body2">
                                                {c.content}
                                            </Typography>
                                        </Box>

                                        {canDelete && (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => deleteComment(c._id)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
