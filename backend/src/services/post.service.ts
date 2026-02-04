/**
 * Post Service
 * 
 * Contains business logic related to Post operations.
 * This layer is responsible for:
 * - Data validation beyond controllers
 * - Authorization checks
 * - Database interaction
 * - Error normalization
 *
 * Controllers should remain thin and delegate logic here.
 */

import Post, { IPost } from "../models/post.model";
import { PostImage, IPostImages } from "../models/postImage.model";
import Like from "../models/like.model";
import Comment from "../models/comment.model";
import { Types } from "mongoose";
import {
    NotFoundError,
    ForbiddenError,
    DatabaseError,
    BadRequestError,
    UnauthorizedError
} from "../utils/errors";
import { uploadToS3, deleteFromS3 } from "../utils/s3";

const resolveFileUrl = async (file: Express.Multer.File): Promise<string> => { 
    const maybe = (file as any).s3Url; 
    if (typeof maybe === "string" && maybe.length > 0) 
        return maybe; 
    return await uploadToS3(file.buffer, file.originalname, file.mimetype); 
};

/**
 * Create a new post
 *
 * @param userId - ID of the authenticated user creating the post
 * @param content - Text content of the post
 * @returns Newly created post document
 */
export const createPost = async (
    userId: Types.ObjectId,
    content: string,
    files?: Express.Multer.File[]
): Promise<IPost> => {
    try {
        // Validate required inputs
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }
        if (!content || !content.trim()) {
            throw new BadRequestError("Post content cannot be empty");
        }

        const trimmed = content.trim();

        // Persist post in database
        const post = await Post.create({
            content: trimmed,
            user: userId,
        });

        // Handle image uploads if provided 
        if (files && files.length > 0) {
            if (files.length > 5) {
                throw new BadRequestError("Maximum 5 images allowed");
            }

            // Upload each image to S3 and save in PostImage table 
            const uploads = await Promise.all(
                files.map(f => resolveFileUrl(f))
            );

            await PostImage.create({ post: post._id, urls: uploads });
        }

        return post;
    } catch (error: any) {
        // Re-throw known validation errors
        if (error instanceof BadRequestError) {
            throw error;
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }

        // Fallback for unexpected DB failures
        throw new DatabaseError("Failed to create post");
    }
};

/**
 * Fetch paginated list of posts
 *
 * Notes:
 * - Excludes soft-deleted posts
 * - Populates user and comment author info
 * - Sorted newest-first (feed style)
 * - Includes associated images from PostImage table
 *
 * @param page - Current page number (1-based)
 * @param limit - Number of posts per page (fixed internally)
 * @param search - Optional search string
 * @returns Paginated posts with metadata
 */
export const getAllPosts = async (page: number = 1, limit: number = 10, search?: string): Promise<{ data: any[]; pagination: any }> => {
    try {
        // Basic validation
        if (!page || page < 1) page = 1;
        if (!limit || limit < 1) limit = 10;

        // Build base filter (exclude soft-deleted posts) 
        const filter: any = { isDeleted: { $ne: true } };

        // If search provided, sanitize and apply filter 
        if (search && typeof search === "string") {
            const trimmed = search.trim();

            // Guard: avoid overly long search strings that could be abused 
            if (trimmed.length > 200) { throw new BadRequestError("Search query too long"); }

            // Use text search if index exists; fallback to case-insensitive regex 
            // Prefer text search for relevance if MongoDB text index is present 
            // Here we attempt text search first, but also support regex fallback. 
            // Note: text search ignores short stopwords; regex is more literal. 
            // Use $text for better performance when index exists.

            const safeRegex = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.content = { $regex: safeRegex, $options: "i" };
        }

        // Pagination: use skip/limit for now
        const skip = (page - 1) * limit;

        // Query total count (respecting filter) 
        const total = await Post.countDocuments(filter);

        // Query posts with populate for author only
        const posts = await Post.find(filter)
            .populate("user", "email")              // populate post author
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        if (!posts || posts.length === 0) { 
            const totalPages = Math.max(1, Math.ceil(total / limit)); 
            return { data: [], pagination: { page, limit, total, totalPages } }; 
        }

        // Attach images from PostImage table 
        const postIds = posts.map(p => p._id);

        // Cast the lean result to a known shape so TS knows `urls` exists
        type PostImagesDoc = { post: Types.ObjectId; urls: string[] };
        const images = (await PostImage.find({ post: { $in: postIds } }).lean()) as PostImagesDoc[];
        
        const postsWithImages = posts.map(post => { 
            const pi = images.find(img => String(img.post) === String(post._id)); 
            return { ...post, images: pi ? pi.urls : [] }; 
        });

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return { data: postsWithImages, pagination: { page, limit, total, totalPages } };
    }
    catch (error: any) {
        if (error instanceof BadRequestError) { throw error; }
        throw new DatabaseError("Failed to fetch posts");
    }
};

/**
 * Retrieve a single post by ID
 *
 * @param postId - ID of the post
 * @returns Post document
 * @throws BadRequestError if postId is invalid
 * @throws NotFoundError if post doesn't exist or is deleted
 * @throws DatabaseError for other database issues
 */
export const getPost = async (postId: string): Promise<IPost> => {
    try {
        // Validate postId format and type
        if (!postId || typeof postId !== "string") {
            throw new BadRequestError("Post ID must be a valid string");
        }

        if (!Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID format");
        }

        const post = await Post.findById(postId).populate({
            path: "user",
            select: "email",
            match: { isDeleted: false }
        });

        if (!post) {
            throw new NotFoundError("Post");
        }

        if (post.isDeleted) {
            throw new NotFoundError("Post (deleted)");
        }

        return post;
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        console.error("Error retrieving post:", error);
        throw new DatabaseError("Failed to retrieve post");
    }
};

/**
 * Update an existing post
 *
 * Authorization:
 * - Only the post owner can update
 *
 * @param postId - ID of the post to update
 * @param userId - ID of the authenticated user
 * @param content - Updated post content
 * @param files - optional new image files (≤5, ≤1MB each)
 * @param replaceMap - optional mapping of imageId → new file to replace specific images
 */
export const updatePost = async (
    postId: string,
    userId: Types.ObjectId,
    content: string,
    files?: Express.Multer.File[],
    replaceMap?: { [index: number]: Express.Multer.File }
): Promise<IPost> => {
    try {
        // Validate identifiers thoroughly
        if (!postId || !Types.ObjectId.isValid(postId)) throw new BadRequestError("Invalid post ID");

        if (!userId) {
            throw new BadRequestError("User ID is required for authorization");
        }

        if (!content || !content.trim()) {
            throw new BadRequestError("Post content must be a valid string");
        }

        // Trim content to prevent whitespace-only updates
        const trimmedContent = content.trim();
        const post = await Post.findById(postId);

        // Ensure post exists and is not deleted
        if (!post) {
            throw new NotFoundError("Post");
        }

        if (post.isDeleted) {
            throw new NotFoundError("Post (already deleted)");
        }

        // Authorization check
        if (post.user.toString() !== userId.toString()) {
            throw new ForbiddenError("You can only edit your own posts");
        }

        // Apply update with validation
        post.content = trimmedContent;

        let postImages = await PostImage.findOne({ post: post._id }) as IPostImages | null;
        const hasNewFiles = Array.isArray(files) && files.length > 0; 
        const hasReplacements = replaceMap && Object.keys(replaceMap).length > 0; 
        
        if (!postImages && (hasNewFiles || hasReplacements)) { 
            postImages = new PostImage({ post: post._id, urls: [] }); 
        } 
        
        // Handle replacements first (so indexes refer to original array) 
        if (hasReplacements && postImages) { 
            for (const [indexStr, newFile] of Object.entries(replaceMap!)) { 
                const index = parseInt(indexStr, 10); 
                
                if (Number.isNaN(index)) continue; 
                if (index < 0 || index >= postImages.urls.length) { 
                    // ignore invalid indexes; alternatively throw BadRequestError if you prefer strict behavior 
                    continue; 
                } 
                
                // Delete old from S3 (best-effort) 
                try { 
                    await deleteFromS3(postImages.urls[index]); 
                } 
                catch (err) { 
                    console.warn("Failed to remove old image from S3:", err); 
                } 
                
                // Resolve new URL (use middleware-provided s3Url if present) 
                const newUrl = await resolveFileUrl(newFile); postImages.urls[index] = newUrl; 
            } 
        } 
        
        // Handle appending new images 
        if (hasNewFiles && postImages) { 
            // total after append must be <= 5 
            const totalAfter = postImages.urls.length + files!.length; 
            
            if (totalAfter > 5) throw new BadRequestError("Maximum 5 images allowed per post"); 
            const uploads = await Promise.all(files!.map(f => resolveFileUrl(f))); 
            postImages.urls.push(...uploads); 
        }

        if (postImages) await postImages.save();
        const updatedPost = await post.save();
        return updatedPost;
    } catch (error: any) {
        if (
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof BadRequestError
        ) {
            throw error;
        }

        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }

        throw new DatabaseError("Failed to update post");
    }
};

/**
 * Soft delete a post
 *
 * Notes:
 * - Post is not physically removed
 * - Preserves relationships and moderation history
 * - Cleans up associated images from S3 and PostImage table
 *
 * Authorization:
 * - Only the post owner can delete
 *
 * @param postId - ID of the post
 * @param userId - ID of the authenticated user
 */
export const deletePost = async (
    postId: string,
    userId: Types.ObjectId
): Promise<void> => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.findById(postId);

        if (!post) {
            throw new NotFoundError("Post");
        }
        if (post.isDeleted) {
            throw new NotFoundError("Post (already deleted)");
        }

        // Authorization check
        if (post.user.toString() !== userId.toString()) {
            throw new ForbiddenError("You can only delete your own posts");
        }

        const postImages = await PostImage.findOne({ post: post._id }); 
        
        if (postImages) { 
            for (const url of postImages.urls) { 
                try { 
                    await deleteFromS3(url); 
                } 
                catch (err) { 
                    console.warn("Failed to remove image from S3:", err); 
                } 
            } 
            
            await postImages.deleteOne(); 
        }

        // Soft delete instead of permanent removal
        post.isDeleted = true;
        await post.save();
    } catch (error: any) {
        if (
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof BadRequestError
        ) {
            throw error;
        }

        throw new DatabaseError("Failed to delete post");
    }
};

/**
 * Toggle like on a post
 *
 * Behavior:
 * - If user already liked → unlike
 * - If not liked → add like
 *
 * @param postId - Target post ID
 * @param userId - Authenticated user ID
 * @returns Updated post document
 */
export const toggleLike = async (postId: string, userId: Types.ObjectId) => {
    if (!postId || !Types.ObjectId.isValid(postId)) { 
        throw new BadRequestError("Invalid post ID"); 
    } 
    
    if (!userId) { 
        throw new UnauthorizedError("User not authenticated"); 
    } 
    
    let likeDoc = await Like.findOne({ post: postId }); 
    if (!likeDoc) { 
        likeDoc = await Like.create({ post: postId, users: [userId], count: 1 }); 
    } 
    else { 
        const alreadyLiked = likeDoc.users.some(u => u.toString() === userId.toString()); 
        if (alreadyLiked) { 
            likeDoc.users = likeDoc.users.filter(u => u.toString() !== userId.toString()); 
        } 
        else { 
            likeDoc.users.push(userId); 
        } 
        likeDoc.count = likeDoc.users.length; 
        await likeDoc.save(); 
    } 
    
    // Always return unified shape 
    return { likesCount: likeDoc.count, likedByCurrentUser: likeDoc.users.some(u => u.toString() === userId.toString()), users: likeDoc.users }; 
};

export const getLikesState = async (postId: string, userId?: Types.ObjectId) => { 
    if (!postId || !Types.ObjectId.isValid(postId)) { 
        throw new BadRequestError("Invalid post ID"); 
    } 
    
    const likeDoc = await Like.findOne({ post: postId }); 
    
    if (!likeDoc) { 
        return { likesCount: 0, likedByCurrentUser: false, users: [] }; 
    } 
    console.log("getLikesState for", postId);
    return { likesCount: likeDoc.count, likedByCurrentUser: userId ? likeDoc.users.some(u => u.toString() === userId.toString()) : false, users: likeDoc.users }; 
};

/**
 * Add a comment to a post
 *
 * @param postId - Target post ID
 * @param userId - Comment author ID
 * @param content - Comment text
 * @returns Updated post and newly added comment
 */
export const addComment = async (
    postId: string,
    userId: Types.ObjectId,
    content: string
) => {
    try {
        // Validate inputs
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        if (!content || typeof content !== "string") {
            throw new BadRequestError("Comment content is required");
        }

        let commentDoc = await Comment.findOne({ post: postId }); 
        
        if (!commentDoc) { 
            commentDoc = await Comment.create({ post: postId, comments: [{ user: userId, content }], users: [userId], count: 1 }); 
        } 
        else { 
            commentDoc.comments.push({ user: userId, content }); 
            
            if (!commentDoc.users.some(u => u.toString() === userId.toString())) { 
                commentDoc.users.push(userId); 
            } 
            
            commentDoc.count = commentDoc.comments.length; 
            await commentDoc.save(); 
        } 
        return { postId, comments: commentDoc.comments, commentsCount: commentDoc.count };
    } 
    catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }

        throw new DatabaseError("Failed to add comment");
    }
};

/**
 * Delete a comment from a post
 *
 * Authorization:
 * - Comment owner OR post owner may delete
 *
 * @param postId - Parent post ID
 * @param commentId - Comment ID
 * @param userId - Authenticated user ID
 * @returns Updated post document
 */
export const deleteComment = async (
    postId: string,
    commentId: string,
    userId: Types.ObjectId
) => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }
        if (!commentId || !Types.ObjectId.isValid(commentId)) {
            throw new BadRequestError("Invalid comment ID");
        }
        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        const commentDoc = await Comment.findOne({ post: postId });
        if (!commentDoc) {
            throw new NotFoundError("No comments found for this post");
        }

        const comment = commentDoc.comments.find(c => c._id!.toString() === commentId);
        if (!comment) {
            throw new NotFoundError("Comment not found");
        }

        // Only comment author OR post author can delete
        if (comment.user.toString() !== userId.toString()) {
            throw new UnauthorizedError("Not allowed to delete this comment");
        }

        commentDoc.comments = commentDoc.comments.filter(c => c._id!.toString() !== commentId);
        commentDoc.count = commentDoc.comments.length;
        await commentDoc.save();

        return {
            postId,
            comments: commentDoc.comments,
            commentsCount: commentDoc.count
        };
    } catch (error: any) {
        if (
            error instanceof BadRequestError ||
            error instanceof UnauthorizedError ||
            error instanceof NotFoundError
        ) {
            throw error;
        }
        throw new DatabaseError("Failed to delete comment");
    }
};

/**
 * Get comments state for a post
 *
 * @param postId - Target post ID
 * @returns { commentsCount, comments }
 */
export const getCommentsState = async (postId: string) => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        const commentDoc = await Comment.findOne({ post: postId }).populate("comments.user", "email");

        if (!commentDoc) {
            return { commentsCount: 0, comments: [] };
        }
        console.log("getCommentsState for", postId);
        return {
            commentsCount: commentDoc.count,
            comments: commentDoc.comments,
        };
    } catch (error: any) {
        if (error instanceof BadRequestError || error instanceof NotFoundError) {
            throw error;
        }
        throw new DatabaseError("Failed to fetch comments state");
    }
};