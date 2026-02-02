/**
 * API Error Re-export
 *
 * Purpose:
 * - Provides a backward-compatible import path for ApiError
 * - All new code should import from `errors.ts` instead
 *
 * Deprecation:
 * - This file is maintained only for legacy code
 * - Do not use for new features or modules
 *
 * Example (legacy):
 * import { ApiError } from './utils/apiError';
 *
 * Recommended (new code):
 * import { ApiError } from './utils/errors';
 */

// Re-export ApiError class from errors.ts for backward compatibility
export { ApiError } from "./errors";
