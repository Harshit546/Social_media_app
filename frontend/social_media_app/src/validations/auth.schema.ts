import { z } from "zod";

/**
 * Reusable password validation rules
 * Centralizing this avoids duplication and keeps rules consistent
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(32, "Password must be at most 32 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * User registration schema
 * Used when creating a new account
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

/**
 * User login schema
 * Login is simpler — no need to repeat full password rules
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Useful inferred types (recommended)
 * Keeps backend & frontend perfectly in sync
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
