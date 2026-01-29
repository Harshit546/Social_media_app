import { Request, Response, NextFunction } from "express";
import { createPostSchema, updatePostSchema } from "../validations/post.schema";
import * as postService from "../services/post.service";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {content} = createPostSchema.parse(req.body);

        const post = await postService.createPost(req.user.id, content);

        res.status(201).json(post);
    }
    catch (err) {
        next(err);
    }
} 

export const getAllPosts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await postService.getAllPosts();
        res.json(posts);
    }
    catch (err) {
        next(err);
    }
}

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {content} = updatePostSchema.parse(req.body);
        const post = await postService.updatePost(req.params.id as string, req.user.id, content);
        res.json(post);
    }
    catch (err) {
        next(err);
    }
}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await postService.deletePost(req.params.id as string, req.user.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}