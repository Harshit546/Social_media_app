import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchClient, API_BASE } from "../api/fetchClient";
import { Button, Card, CardContent, TextField, Container, Box, CircularProgress, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Max allowed file size for uploaded images (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];

// Component to edit an existing post
export default function EditPost() {
    const { id } = useParams(); // Get post ID from URL
    const navigate = useNavigate(); // Navigation hook

    // Form state
    const [content, setContent] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null); // New uploaded image
    const [currentThumbnail, setCurrentThumbnail] = useState(""); // Existing image from post
    const [loading, setLoading] = useState(true); // Loader while fetching post
    const [updating, setUpdating] = useState(false); // Loader while updating post
    const [error, setError] = useState<string | null>(null); // Error messages
    const [fileError, setFileError] = useState<string | null>(null); // File validation errors

    // Fetch post data when component mounts
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setError(null); // Clear any previous errors

                if (!id) {
                    throw new Error("Post ID is missing");
                }

                // Fetch post data
                const res = await fetchClient(`/posts/${id}`);
                const post = res?.data || res;

                if (!post || !post.content) {
                    throw new Error("Invalid post data received");
                }

                // Populate form state
                setContent(post.content);
                if (post.thumbnail) setCurrentThumbnail(post.thumbnail);
            } catch (err: any) {
                const errorMsg = err?.message || "Failed to load post";
                setError(errorMsg);
                console.error("Fetch post error:", err);

                // Redirect to feed after showing error for 2 seconds
                setTimeout(() => navigate("/feed", { replace: true }), 2000);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, navigate]);

    // Handle file selection and validation
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null); // Clear previous file errors
        const file = e.target.files?.[0];

        if (!file) {
            setThumbnail(null);
            return;
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setFileError(`Invalid file type. Allowed: JPEG, PNG, GIF, WebP, JPG`);
            e.target.value = ""; // Clear input
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`File size exceeds 5MB limit. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            e.target.value = "";
            return;
        }

        // Set valid file to state
        setThumbnail(file);
    };

    // Handle post update submission
    const updatePost = async () => {
        setError(null);

        // Validate content
        if (!content || !content.trim()) {
            setError("Post content cannot be empty");
            return;
        }

        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append("content", content.trim());

            // Include current thumbnail if no new file uploaded
            if (!thumbnail && currentThumbnail) {
                formData.append("thumbnail", currentThumbnail);
            }

            // Include new thumbnail if uploaded
            if (thumbnail) {
                formData.append("thumbnail", thumbnail);
            }

            // Send PUT request to update post
            const res = await fetchClient(`/posts/${id}`, {
                method: "PUT",
                body: formData
            });

            if (!res?.success && !res?.data) {
                throw new Error(res?.message || "Update failed");
            }

            // Navigate back to feed after successful update
            navigate("/feed", { replace: true });
        } catch (err: any) {
            const errorMsg = err?.message || "Failed to update post";
            setError(errorMsg);
            console.error("Update post error:", err);
        } finally {
            setUpdating(false);
        }
    };

    // Show loading screen while fetching post
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CircularProgress />
            </div>
        );
    }

    // Main form UI
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
                        {/* Title and subtitle */}
                        <div className="text-center mb-8">
                            <h1 className="text-[28px] font-[700] text-[#333] mb-2">Edit Post</h1>
                            <p className="text-[14px] text-[#666]">Update your post content and image</p>
                        </div>

                        {/* Display errors if any */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {fileError && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                {fileError}
                            </Alert>
                        )}

                        <div className="flex flex-col gap-4">
                            {/* Post content input */}
                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                label="Post Content"
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    setError(null); // Clear error on change
                                }}
                                error={error?.includes("content") || false}
                                disabled={updating}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '& fieldset': { borderColor: '#e0e0e0' },
                                        '&:hover fieldset': { borderColor: '#667eea' },
                                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                    }
                                }}
                            />

                            {/* Display current thumbnail if exists */}
                            {currentThumbnail && !thumbnail && (
                                <Box sx={{ mt: 2 }}>
                                    <p className="text-[12px] text-[#666] mb-2">Current Image:</p>
                                    <img
                                        src={`${API_BASE}/uploads/${currentThumbnail}`}
                                        alt="Current post thumbnail"
                                        style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 8 }}
                                        onError={() => setError("Failed to load current image")}
                                    />
                                </Box>
                            )}

                            {/* Preview new uploaded thumbnail */}
                            {thumbnail && (
                                <Box sx={{ mt: 2 }}>
                                    <p className="text-[12px] text-[#666] mb-2">New Image Preview:</p>
                                    <img
                                        src={URL.createObjectURL(thumbnail)}
                                        alt="New post thumbnail"
                                        style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 8 }}
                                        onError={() => setError("Failed to preview image")}
                                    />
                                </Box>
                            )}

                            {/* File input */}
                            <Box>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={updating}
                                    style={{
                                        padding: '8px',
                                        border: fileError ? '2px solid #f44336' : '1px solid #e0e0e0',
                                        borderRadius: '4px',
                                        width: '100%'
                                    }}
                                />
                                <p className="text-[12px] text-[#999] mt-1">
                                    Max size: 5MB | Formats: JPEG, PNG, GIF, WebP
                                </p>
                            </Box>

                            {/* Action buttons: Cancel and Update */}
                            <div className="flex gap-3">
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => navigate("/feed", { replace: true })}
                                    startIcon={<ArrowBackIcon />}
                                    disabled={updating}
                                    sx={{
                                        color: '#667eea',
                                        borderColor: '#667eea',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                            borderColor: '#667eea'
                                        },
                                        '&:disabled': { opacity: 0.6 }
                                    }}>
                                    Cancel
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={updatePost}
                                    disabled={updating || !content.trim()}
                                    sx={{
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                            transform: 'translateY(-2px)'
                                        },
                                        '&:disabled': { opacity: 0.6 },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {updating ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </div>
    )
}
