import { error } from "@sveltejs/kit";
import { ResultAsync } from "neverthrow";

import type { PageLoadEvent } from "./$types";
import type { PostMetadata } from "$lib/types";
import type { AppError } from "$lib/errors";

type Post = { default: () => any; metadata: PostMetadata };

export async function load({ params }: PageLoadEvent) {
    const slug = params.slug ?? "";

    const result = await ResultAsync.fromPromise(
        import(`$lib/data/posts/${slug}/index.md`) as Promise<Post>,
        (): AppError => ({ type: "POST_NOT_FOUND", slug }),
    );

    if (result.isErr()) {
        throw error(404, {
            message: `Could not find post: ${slug}`,
            errorType: result.error.type,
        });
    }

    const post = result.value;
    return {
        content: post.default,
        meta: post.metadata,
    };
}
