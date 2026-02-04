import React, { useState } from "react";
import { fetchClient } from "../api/fetchClient";
import { Button, TextField, Card, CardContent, Box } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

/**
 * PostForm
 * Form component used to create a new post.
 *
 * Features:
 * - Text content submission
 * - Optional multiple image uploads (≤5, ≤1MB each)
 * - Uses multipart/form-data via FormData
 * - Notifies parent component after successful creation
 *
 * Props:
 * - onPostCreated?: callback to refresh posts/feed
 */
export default function PostForm({ onPostCreated }: { onPostCreated?: () => void }) {
    /**
     * Text content of the post
     */
    const [content, setContent] = useState("");

    /**
     * Images upload
     */
    const [images, setImages] = useState<File[]>([]);

    /**
     * Loading state to prevent duplicate submissions
     */
    const [loading, setLoading] = useState(false);

    /** Handle file selection with validation */ 
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
        const files = e.target.files ? Array.from(e.target.files) : []; 
        
        if (files.length > 5) { 
            alert("You can upload a maximum of 5 images."); 
            return; 
        } 
        
        const oversized = files.find(f => f.size > 1024 * 1024); 
        
        if (oversized) { 
            alert("Each image must be ≤ 1MB."); 
            return; 
        } 
        setImages(files); 
    };

    /**
     * Handles post submission
     * - Validates at least content or image is present
     * - Sends multipart/form-data request
     */
    const submitPost = async () => {
        // Prevent empty post (no text AND no image)
        if (!content.trim() && images.length === 0) return;

        setLoading(true);
        try {
            /**
             * FormData is required for file uploads.
             * Do NOT manually set Content-Type header.
             */
            const formData = new FormData();
            formData.append("content", content);

            images.forEach(file => formData.append("images", file));

            // Create post API call
            await fetchClient("/posts", {
                method: "POST",
                body: formData,
            });

            // Reset form after successful submission
            setContent("");
            setImages([]);

            // Notify parent component (e.g. refresh feed)
            onPostCreated?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                marginBottom: 3,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <div className="flex flex-col gap-4">
                    {/* Post Content Input */}
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                backgroundColor: "#f8f9fa",
                                "& fieldset": { borderColor: "#e0e0e0" },
                                "&:hover fieldset": { borderColor: "#667eea" },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#667eea",
                                },
                            },
                        }}
                    />

                    {/* Thumbnail Image Input */}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                    />

                    {/* Preview selected filenames */}
                    {images.length > 0 && (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {images.map((img, idx) => (
                                <span key={idx}>{img.name}</span>
                            ))}
                        </Box>
                    )}

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        onClick={submitPost}
                        disabled={loading || (!content.trim() && images.length === 0)}
                        endIcon={<SendIcon />}
                        sx={{
                            background:
                                "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                            padding: "10px 24px",
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: 15,
                            "&:hover": {
                                boxShadow:
                                    "0 6px 20px rgba(102,126,234,0.4)",
                                transform: "translateY(-2px)",
                            },
                            transition: "all 0.3s ease",
                        }}
                    >
                        {loading ? "Posting..." : "Share Post"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
