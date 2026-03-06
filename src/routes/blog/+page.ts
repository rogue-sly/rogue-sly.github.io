import { error } from "@sveltejs/kit";
import { ResultAsync } from "neverthrow";

import type { PageLoadEvent } from "./$types";
import type { PostMetadata } from "$lib/types";
import type { AppError } from "$lib/errors";

export async function load({ fetch }: PageLoadEvent) {
    const result = await ResultAsync.fromPromise(
        fetch("/api/posts.json").then((res) => {
            if (!res.ok) {
                return Promise.reject({ status: res.status });
            }
            return res.json() as Promise<PostMetadata[]>;
        }),
        (cause): AppError => {
            const status = (cause as { status?: number }).status;
            return { type: "NETWORK_ERROR", url: "/api/posts.json", status };
        },
    );

    if (result.isErr()) {
        const err = result.error;
        throw error(err.type === "NETWORK_ERROR" && err.status ? err.status : 500, {
            message: "Failed to load posts.",
            errorType: err.type,
        });
    }

    return { posts: result.value };
}
