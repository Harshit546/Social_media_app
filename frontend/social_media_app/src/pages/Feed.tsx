import { useEffect, useState } from "react";
import { fetchClient } from "../api/fetchClient";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";
import { Container, CircularProgress, Box, Button, Pagination } from "@mui/material";

export default function Feed() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const loadPosts = async (page: number) => {
        setLoading(true);
        try {
            const data = await fetchClient(`/posts?page=${page}`);
            setPosts(Array.isArray(data.data) ? data.data : data.data ?? []);
            if (data.pagination) {
                setPagination(data.pagination);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to load posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(currentPage);
    }, [currentPage]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (_event: any, value: number) => {
        setCurrentPage(value);
    };

    const handlePostCreated = async () => {
        // Reload posts from page 1 to show the new post with proper data
        await loadPosts(1);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen pb-10">
            <Navbar />
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <PostForm onPostCreated={() => handlePostCreated()} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress sx={{ color: 'white' }} />
                    </Box>
                ) : posts.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        py: 6,
                        color: 'white'
                    }}>
                        <p className="text-[18px] font-[500]">No posts yet</p>
                        <p className="text-[14px] opacity-[0.8]">Be the first to share something!</p>
                    </Box>
                ) : (
                    <>
                        {posts.map((post) => (
                            <PostCard key={post._id} post={post} onDelete={(id: any) => setPosts(posts.filter(p => p._id !== id))}  />
                        ))}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                mt: 4,
                                pt: 4,
                                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                {/* Next and Previous Buttons */}
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

                                {/* Page Numbers */}
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

                                {/* Page Info */}
                                <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', mt: 1 }}>
                                    Page {currentPage} of {totalPages} {pagination && `(Total: ${pagination.total} posts)`}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </div>
    )
}