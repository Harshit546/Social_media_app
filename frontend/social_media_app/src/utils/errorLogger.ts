import { fetchClient } from "../api/fetchClient";

/**
 * Send a client-side error to the backend error logs.
 *
 * This is fire-and-forget: it should never throw inside UI code.
 */
export async function logFrontendError(params: {
    apiName?: string;
    error: any;
}) {
    const { apiName, error } = params;

    try {
        await fetchClient("/logs/error", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apiName: apiName ?? window.location.pathname,
                errorDetail: normalizeError(error),
            }),
        });
    } catch {
        // Swallow logging errors – do not break the UI
    }
}

function normalizeError(err: any) {
    if (!err) return { message: "Unknown error" };

    if (err instanceof Error) {
        return {
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
    }

    if (typeof err === "string") {
        return { message: err };
    }

    if (typeof err === "object") {
        return err;
    }

    return { value: String(err) };
}

