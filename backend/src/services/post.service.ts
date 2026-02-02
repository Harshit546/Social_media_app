import Post, { IPost } from "../models/post.model";
import { Types } from "mongoose";
import { NotFoundError, ForbiddenError, DatabaseError, BadRequestError } from "../utils/errors";

export const createPost = async (userId: Types.ObjectId, content: string): Promise<IPost> => {
    try {
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.create({
            content,
            user: userId
        });

        return post;
    } catch (error: any) {
        if (error instanceof BadRequestError) {
            throw error;
        }
        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }
        throw new DatabaseError("Failed to create post");
    }
};

export const getAllPosts = async (page: number = 1, limit: number = 5): Promise<{ posts: IPost[]; total: number; pages: number }> => {
    try {
        // Validate pagination parameters
        const pageNum = Math.max(1, page);
        const limitNum = 5; // Always 5 posts per page
        const skip = (pageNum - 1) * limitNum;

        // Get total count and paginated posts (excluding deleted posts)
        const [posts, total] = await Promise.all([
            Post.find({ isDeleted: false })
                .populate({ path: "user", select: "email", match: { isDeleted: false } })
                .populate({ path: "comments.user", select: "email" })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Post.countDocuments({ isDeleted: false })
        ]);

        const pages = Math.ceil(total / limitNum);

        return { posts, total, pages };
    } catch (error: any) {
        throw new DatabaseError("Failed to retrieve posts");
    }
};

export const updatePost = async (postId: string, userId: Types.ObjectId, content: string): Promise<IPost> => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.findById(postId);

        if (!post || post.isDeleted) {
            throw new NotFoundError("Post");
        }

        if (post.user.toString() !== userId.toString()) {
            throw new ForbiddenError("You can only edit your own posts");
        }

        post.content = content;

        const updatedPost = await post.save();
        return updatedPost;
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError) {
            throw error;
        }
        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }
        throw new DatabaseError("Failed to update post");
    }
};

export const deletePost = async (postId: string, userId: Types.ObjectId): Promise<void> => {
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

        if (post.user.toString() !== userId.toString()) {
            throw new ForbiddenError("You can only delete your own posts");
        }

        // Soft delete: mark as deleted instead of removing
        post.isDeleted = true;
        await post.save();
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError) {
            throw error;
        }
        throw new DatabaseError("Failed to delete post");
    }
};

export const toggleLike = async (postId: string, userId: Types.ObjectId): Promise<IPost> => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            throw new NotFoundError("Post");
        }

        const alreadyLiked = post.likes.some(l => l.toString() === userId.toString());
        if (alreadyLiked) {
            post.likes = post.likes.filter(l => l.toString() !== userId.toString());
        } else {
            post.likes.push(new Types.ObjectId(userId));
        }

        const updated = await post.save();
        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);
        return updated;
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        throw new DatabaseError("Failed to toggle like");
    }
};

export const addComment = async (postId: string, userId: Types.ObjectId, content: string) => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }
        if (!content || typeof content !== "string") {
            throw new BadRequestError("Comment content is required");
        }

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            throw new NotFoundError("Post");
        }

        post.comments.push({ user: userId, content } as any);

        const updated = await post.save();
        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);
        const newComment = updated.comments[updated.comments.length - 1];
        return { post: updated, comment: newComment };
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        throw new DatabaseError("Failed to add comment");
    }
};

export const deleteComment = async (postId: string, commentId: string, userId: Types.ObjectId) => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }
        if (!commentId || !Types.ObjectId.isValid(commentId)) {
            throw new BadRequestError("Invalid comment ID");
        }
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            throw new NotFoundError("Post");
        }

        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            throw new NotFoundError("Comment");
        }

        const isCommentOwner = comment.user.toString() === userId.toString();
        const isPostOwner = post.user.toString() === userId.toString();

        if (!isCommentOwner && !isPostOwner) {
            throw new ForbiddenError("You can only delete your own comment or comments on your post");
        }

        post.comments = post.comments.filter(c => c._id?.toString() !== commentId);
        const updated = await post.save();
        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);
        return updated;
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ForbiddenError) {
            throw error;
        }
        throw new DatabaseError("Failed to delete comment");
    }
};