/**
 * Discriminated union of all typed application errors.
 * Use this as the Err side of neverthrow Result/ResultAsync types.
 */
export type AppError =
    | { type: "POST_NOT_FOUND"; slug: string }
    | { type: "POST_LOAD_ERROR"; path: string; cause: unknown }
    | { type: "POSTS_LOAD_ERROR"; cause: unknown }
    | { type: "NETWORK_ERROR"; url: string; status?: number }
    | { type: "PARSE_ERROR"; context: string; cause: unknown }
    | { type: "STREAM_ERROR"; message: string }
    | { type: "WEBGL_ERROR"; message: string }
    | { type: "CONNECTION_FAILED"; cause?: unknown }
    | { type: "SIGNAL_LOST" };

/**
 * Returns a human-readable message for an AppError.
 * Use this where you need to display or log error details.
 */
export function appErrorMessage(err: AppError): string {
    switch (err.type) {
        case "POST_NOT_FOUND":
            return `Post not found: ${err.slug}`;
        case "POST_LOAD_ERROR":
            return `Failed to load post at ${err.path}`;
        case "POSTS_LOAD_ERROR":
            return `Failed to load posts`;
        case "NETWORK_ERROR":
            return err.status
                ? `Network error ${err.status} fetching ${err.url}`
                : `Network error fetching ${err.url}`;
        case "PARSE_ERROR":
            return `Parse error in ${err.context}`;
        case "STREAM_ERROR":
            return `Stream error: ${err.message}`;
        case "WEBGL_ERROR":
            return `WebGL error: ${err.message}`;
        case "CONNECTION_FAILED":
            return `Connection failed`;
        case "SIGNAL_LOST":
            return `Signal lost`;
    }
}
