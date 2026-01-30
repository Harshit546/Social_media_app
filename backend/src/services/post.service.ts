import Post, { IPost } from "../models/post.model";
import { Types } from "mongoose";
import { NotFoundError, ForbiddenError, DatabaseError, BadRequestError } from "../utils/errors";

const populatePost = (post: IPost) =>
    post.populate([
        { path: "user", select: "email" },
        { path: "comments.user", select: "email" }
    ]);

export const createPost = async (userId: Types.ObjectId, content: string, images?: string[]): Promise<IPost> => {
    try {
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.create({
            content: content || undefined,
            images: images || [],
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

export const getAllPosts = async (): Promise<IPost[]> => {
    try {
        const posts = await Post.find()
            .populate({ path: "user", select: "email", match: { isDeleted: false } })
            .populate({ path: "comments.user", select: "email" })
            .sort({ createdAt: -1 });

        return posts;
    } catch (error: any) {
        throw new DatabaseError("Failed to retrieve posts");
    }
};

export const updatePost = async (postId: string, userId: Types.ObjectId, content: string, images?: string[]): Promise<IPost> => {
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
            throw new ForbiddenError("You can only edit your own posts");
        }

        post.content = content || post.content;
        if (images) {
            post.images = images;
        }

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

        await post.deleteOne();
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
        if (!post) {
            throw new NotFoundError("Post");
        }

        const alreadyLiked = post.likes.some(l => l.toString() === userId.toString());
        if (alreadyLiked) {
            post.likes = post.likes.filter(l => l.toString() !== userId.toString()) as any;
        } else {
            post.likes.push(new Types.ObjectId(userId));
        }

        const updated = await post.save();
        await populatePost(updated);
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
        if (!post) {
            throw new NotFoundError("Post");
        }

        const comment = { user: userId, content };
        post.comments.push({ user: userId, content } as any);

        const updated = await post.save();
        await populatePost(updated);
        // return the newly added comment (last item)
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
        if (!post) {
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
        await populatePost(updated);
        return updated;
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ForbiddenError) {
            throw error;
        }
        throw new DatabaseError("Failed to delete comment");
    }
};