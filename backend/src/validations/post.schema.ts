import {z} from "zod";

export const createPostSchema = z.object({
    content: z.string().min(1).max(500)
})

export const updatePostSchema = z.object({
    content: z.string().min(1).max(500)
})