import {email, z} from "zod"

export const registerSchema = z.object({
    email: z.string().email({message: "Invalid email"}),
    password: z.string().min(8, "Password must be atleast 8 characters").max(32, "Password must be at most 32 characters").regex(/[A-Z]/, "Password must contain 1 uppercase letter").regex(/[a-z]/, "Password must contain 1 lowercase letter").regex(/[0-9]/, "Password must contain 1 digit").regex(/[^A-Za-z0-9]/, "Password must contain 1 special character")
})

export const loginSchema = z.object({
    email: z.string().email({message: "Invalid email"}),
    password: z.string().min(8)
})