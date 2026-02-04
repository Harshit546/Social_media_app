import { useEffect, useState, useRef } from "react";
import { fetchClient } from "../api/fetchClient";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";
import { Container, CircularProgress, Box, Button, Pagination, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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

    // Search term state 
    const [searchTerm, setSearchTerm] = useState<string>(""); 
    
    // Debounced search term to avoid rapid requests 
    const [debouncedSearch, setDebouncedSearch] = useState<string>(""); 
    
    // Ref for debounce timer 
    const debounceRef = useRef<number | null>(null);

    // Function to load posts for a given page
    const loadPosts = async (page: number, search?: string) => {
        setLoading(true); // show loader
        try {
            // Build query string 
            const qs = new URLSearchParams(); 
            qs.set("page", String(page)); 
            qs.set("limit", "10"); 
            if (search && search.trim()) { qs.set("search", search.trim()); } 
            
            const data = await fetchClient(`/posts?${qs.toString()}`); 
            
            // Normalize data: data.data should be an array of posts 
            setPosts(Array.isArray(data.data) ? data.data : data.data ?? []); 
            
            // Save pagination info if returned 
            if (data.pagination) { 
                setPagination(data.pagination); 
                setTotalPages(data.pagination.totalPages); 
            } 
            else { 
                // Fallback: compute pages if backend didn't return pagination 
                setTotalPages(1); 
            }
        } catch (error) {
            console.error("Failed to load posts:", error);
        } finally {
            setLoading(false); // hide loader
        }
    };

    // Load posts whenever currentPage or debouncedSearch changes 
    useEffect(() => { 
        loadPosts(currentPage, debouncedSearch); 
    }, [currentPage, debouncedSearch]);

    // Debounce searchTerm updates 
    useEffect(() => { 
        if (debounceRef.current) { 
            window.clearTimeout(debounceRef.current); 
        } 
        // Wait 300ms after user stops typing 
        debounceRef.current = window.setTimeout(() => { 
            setDebouncedSearch(searchTerm); 
            // Reset to first page when search changes 
            setCurrentPage(1); 
        }, 300); 
        
        return () => { 
            if (debounceRef.current) { 
                window.clearTimeout(debounceRef.current); 
            } 
        }; 
    }, [searchTerm]);

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
        await loadPosts(1, debouncedSearch);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen pb-10">
            {/* Navbar always visible */}
            <Navbar />

            {/* Main content container */}
            <Container maxWidth="sm" sx={{ py: 4 }}>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
                    <TextField placeholder="Search posts by content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            backgroundColor: "#fff",
                            borderRadius: 2
                        }}
                    />

                    {/* Post creation form */}
                    <PostForm onPostCreated={() => handlePostCreated()} />
                </Box>

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
