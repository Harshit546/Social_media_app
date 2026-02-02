import { useEffect, useState } from "react";
import { fetchClient } from "../api/fetchClient";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";
import { Container, CircularProgress, Box, Button, Pagination } from "@mui/material";

// Feed page component: displays posts with pagination and allows creating new posts
export default function Feed() {
    // State for storing posts fetched from backend
    const [posts, setPosts] = useState<any[]>([]);

    // Loading state for API requests
    const [loading, setLoading] = useState(true);

    // Current page number for pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Total number of pages returned from backend
    const [totalPages, setTotalPages] = useState(1);

    // Optional: full pagination info returned by backend (like total posts)
    const [pagination, setPagination] = useState<any>(null);

    // Function to load posts for a given page
    const loadPosts = async (page: number) => {
        setLoading(true); // show loader
        try {
            // Fetch posts with query parameter for pagination
            const data = await fetchClient(`/posts?page=${page}`);

            // Normalize data: data.data should be an array of posts
            setPosts(Array.isArray(data.data) ? data.data : data.data ?? []);

            // Save pagination info if returned
            if (data.pagination) {
                setPagination(data.pagination);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to load posts:", error);
        } finally {
            setLoading(false); // hide loader
        }
    };

    // Load posts whenever currentPage changes
    useEffect(() => {
        loadPosts(currentPage);
    }, [currentPage]);

    // Handlers for previous/next page buttons
    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Handler for page number clicks from Pagination component
    const handlePageChange = (_event: any, value: number) => {
        setCurrentPage(value);
    };

    // When a new post is created, reload page 1 to show latest posts
    const handlePostCreated = async () => {
        await loadPosts(1);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen pb-10">
            {/* Navbar always visible */}
            <Navbar />

            {/* Main content container */}
            <Container maxWidth="sm" sx={{ py: 4 }}>

                {/* Post creation form */}
                <PostForm onPostCreated={() => handlePostCreated()} />

                {/* Loading state */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress sx={{ color: 'white' }} />
                    </Box>

                    // No posts yet
                ) : posts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6, color: 'white' }}>
                        <p className="text-[18px] font-[500]">No posts yet</p>
                        <p className="text-[14px] opacity-[0.8]">Be the first to share something!</p>
                    </Box>

                    // Display posts with pagination
                ) : (
                    <>
                        {/* Render all posts */}
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onDelete={(id: any) =>
                                    setPosts(posts.filter(p => p._id !== id))
                                }
                            />
                        ))}

                        {/* Pagination controls, only if more than 1 page */}
                        {totalPages > 1 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    mt: 4,
                                    pt: 4,
                                    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                {/* Previous/Next buttons */}
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        sx={{
                                            backgroundColor: currentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : '#1976d2',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: currentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : '#1565c0'
                                            }
                                        }}
                                    >
                                        ← Previous
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        sx={{
                                            backgroundColor: currentPage === totalPages ? 'rgba(255, 255, 255, 0.3)' : '#1976d2',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: currentPage === totalPages ? 'rgba(255, 255, 255, 0.3)' : '#1565c0'
                                            }
                                        }}
                                    >
                                        Next →
                                    </Button>
                                </Box>

                                {/* Page numbers */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                color: 'white',
                                                borderColor: 'rgba(255, 255, 255, 0.3)'
                                            },
                                            '& .MuiPaginationItem-page.Mui-selected': {
                                                backgroundColor: '#1976d2',
                                                color: 'white'
                                            },
                                            '& .MuiPaginationItem-page:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.6)'
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Page info */}
                                <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', mt: 1 }}>
                                    Page {currentPage} of {totalPages} {pagination && `(Total: ${pagination.total} posts)`}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
}
