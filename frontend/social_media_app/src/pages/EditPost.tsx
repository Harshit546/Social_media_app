import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchClient } from "../api/fetchClient";
import { Button, Card, CardContent, TextField, Container, Box, CircularProgress, Alert, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Max allowed file size for uploaded images (1MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];

// Component to edit an existing post
export default function EditPost() {
    const { id } = useParams(); // Get post ID from URL
    const navigate = useNavigate(); // Navigation hook

    // Form state
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [replaceFiles, setReplaceFiles] = useState<{ [index: number]: File }>({});
    const [previewUrls, setPreviewUrls] = useState<{ [index: number]: string }>({});
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

                const raw = post.images || [];
                const normalized = raw.map((i: any) => (typeof i === "string" ? i : i.url));

                console.log("fetched post:", post);
                console.log("normalized images:", normalized);

                // Populate form state
                setContent(post.content);
                setImages(normalized); // images array from backend
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
    const handleReplaceFile = (index: number, file: File | null) => {
        setFileError(null); // Clear previous file errors

        if (!file) {
            return;
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setFileError(`Invalid file type. Allowed: JPEG, PNG, GIF, WebP, JPG`);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError("File size exceeds 1MB limit.");
            return;
        }

        // revoke old preview if present 
        setPreviewUrls(prev => {
            if (prev[index]) {
                try {
                    URL.revokeObjectURL(prev[index]);
                }
                catch { }
            } const newPreview = URL.createObjectURL(file);
            return { ...prev, [index]: newPreview };
        });

        // Set valid file to state
        setReplaceFiles(prev => ({ ...prev, [index]: file }));
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

            // Attach replacement files with their imageId 
            Object.entries(replaceFiles).forEach(([index, file]) => {
                formData.append(`replaceMap[${index}]`, file);
            });

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

                            {/* Current images with replace option (use index-based replacement) */}
                            {images.length > 0 && (
                                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    {images.map((imgUrl, idx) => {
                                        const preview = previewUrls[idx];
                                        const src = preview ?? imgUrl;
                                        return (
                                            <Box key={idx} sx={{ width: { xs: "100%", sm: "48%" }, display: "flex", flexDirection: "column", gap: 1 }} >
                                                <Typography variant="caption" color="text.secondary">Image {idx + 1}</Typography>
                                                <Box sx={{ width: "100%", height: 200, borderRadius: 2, overflow: "hidden", backgroundColor: "#f4f6fb", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                                    <img src={src} alt={`Post image ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setError("Failed to load image")} />
                                                </Box>

                                                {/* Hidden input + visible button */}
                                                <label style={{ width: "100%" }}>
                                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleReplaceFile(idx, e.target.files ? e.target.files[0] : null)} disabled={updating} />
                                                    <Button variant="outlined" component="span" fullWidth disabled={updating} sx={{ textTransform: "none", borderColor: fileError ? "#f44336" : undefined }} > {replaceFiles[idx] ? "Change selected file" : "Replace image"}
                                                    </Button>
                                                </label>
                                                <Typography variant="caption" color="text.secondary"> Max size: 1MB | Formats: JPEG, PNG, GIF, WebP </Typography>

                                                {replaceFiles[idx] && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Typography variant="caption">{replaceFiles[idx].name}</Typography>
                                                        <Button size="small" onClick={() => {
                                                            // revoke preview and remove replacement 
                                                            if (previewUrls[idx]) { 
                                                                try { 
                                                                    URL.revokeObjectURL(previewUrls[idx]); 
                                                                } 
                                                                catch { } 
                                                                setPreviewUrls(prev => { 
                                                                    const copy = { ...prev }; 
                                                                    delete copy[idx]; 
                                                                    return copy; 
                                                                }); 
                                                            } 
                                                            
                                                            setReplaceFiles(prev => { 
                                                                const copy = { ...prev }; 
                                                                delete copy[idx]; 
                                                                return copy; 
                                                            }); 
                                                            
                                                            setFileError(null);
                                                        }}> Remove </Button> </Box>)} </Box>);
                                    })} </Box>)}

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
