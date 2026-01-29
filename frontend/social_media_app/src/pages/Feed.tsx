import { useEffect, useState } from "react";
import { fetchClient } from "../api/fetchClient";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";
import { Container, CircularProgress, Box } from "@mui/material";

export default function Feed() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchClient("/posts");
                setPosts(data);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    return (
        <div className="min-h-screen pb-10">
            <Navbar />
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <PostForm onPostCreated={(p: any) => setPosts([p, ...posts])} />

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
                    posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))
                )}
            </Container>
        </div>
    )
}