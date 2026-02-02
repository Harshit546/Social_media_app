/**
 * Base URLs for API calls
 */
export const API_BASE = "http://localhost:5000";  // Backend server
export const API_URL = `${API_BASE}/api`;         // API prefix

/**
 * Interface for standardized API error responses
 */
export interface ApiErrorResponse {
  message: string;                 // Error message from server
  statusCode?: number;             // HTTP status code
  errors?: Record<string, any>;    // Optional detailed validation errors
}

/**
 * A reusable fetch client for calling the backend API
 * Handles:
 * - Authorization headers (JWT)
 * - JSON stringification
 * - FormData handling
 * - Error parsing
 * 
 * @param endpoint - API endpoint (e.g., "/posts")
 * @param options - fetch options (method, headers, body, etc.)
 * @returns parsed JSON response from server
 */
export const fetchClient = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  // Retrieve token from localStorage (JWT authentication)
  const token = localStorage.getItem("token");

  // Clone existing headers or create empty object
  const headers: Record<string, string> = { ...(options.headers as any) };

  // If the body exists and is NOT FormData, set JSON headers
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";

    // Automatically stringify the body if it is not already a string
    if (typeof options.body !== "string") {
      options.body = JSON.stringify(options.body);
    }
  }

  // Add Authorization header if token is present
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;

  // Make the fetch call
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network errors or server unreachable
    throw {
      message: "Unable to connect to server",
      statusCode: 0,
    };
  }

  // Parse response safely
  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Response is not valid JSON
      throw {
        message: "Invalid server response",
        statusCode: response.status,
      };
    }
  }

  // Handle HTTP errors
  if (!response.ok) {
    // Remove token on 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem("token");
    }

    // Throw standardized error object
    throw {
      message: data?.message || "Something went wrong",
      statusCode: response.status,
      errors: data?.errors,
    };
  }

  // Return parsed data
  return data;
};
