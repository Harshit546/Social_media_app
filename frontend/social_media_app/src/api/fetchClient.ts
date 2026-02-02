const API_URL = "http://localhost:5000/api";

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, any>;
}

export const fetchClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem("token");

  let res: Response;

  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  } catch {
    throw {
      message: "Unable to connect to server",
      statusCode: 0,
    };
  }

  let data: any = null;

  // Safely parse JSON
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw {
        message: "Invalid server response",
        statusCode: res.status,
      };
    }
  }

  if (!res.ok) {
    // Handle unauthorized globally
    if (res.status === 401) {
      localStorage.removeItem("token");
    }

    throw {
      message: data?.message || "Something went wrong",
      statusCode: res.status,
      errors: data?.errors,
    };
  }

  return data;
};
