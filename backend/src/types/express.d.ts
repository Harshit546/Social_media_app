/**
 * Express Request Type Extensions
 *
 * Purpose:
 * - Extend Express Request interface to include `user` property
 * - Allows TypeScript to recognize authenticated user data on req.user
 * 
 * Usage:
 * - `user` is populated by authentication middleware after verifying JWT
 * - Type can be `JwtPayload` (from jsonwebtoken) or a custom user object
 * - Optional because unauthenticated requests may not have this property
 */

import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            /**
             * Authenticated user information
             * Populated by auth middleware (e.g., verify JWT)
             * Can include custom fields like `id`, `email`, `role`
             */
            user?: JwtPayload | {
                id: string;
                email: string;
                role: string;
                [key: string]: any; // Allow extra properties if needed
            };
        }
    }
}
