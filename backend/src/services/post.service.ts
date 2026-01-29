import Post, {IPost} from "../models/post.model"
import { Types } from "mongoose"
import { ApiError } from "../utils/apiError"

export const createPost = async (userId: Types.ObjectId, content: string): Promise<IPost> => {
    return Post.create({
        content,
        user: userId
    })
}

export const getAllPosts = async () => {
    const posts = await Post.find().populate({path: "user", select: "email", match: {isDeleted: false}}).sort({createdAt: -1});
    return posts;
}

export const updatePost = async (postId: string, userId: Types.ObjectId, content: string) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Not allowed");
    }

    post.content = content;
    return post.save();
}

export const deletePost = async (postId: string, userId: Types.ObjectId) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Not allowed");
    }

    await post.deleteOne();
}