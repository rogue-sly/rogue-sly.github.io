import { error } from "@sveltejs/kit";
import { ResultAsync } from "neverthrow";

import type { ServerLoadEvent } from "@sveltejs/kit";
import type { PostMetadata } from "$lib/types";
import type { AppError } from "$lib/errors";

type Post = { default: () => any; metadata: PostMetadata };

export async function load({ params }: ServerLoadEvent) {
    const slug = params.slug ?? "";
    const result = await ResultAsync.fromPromise(
        import(`../../../lib/data/posts/${slug}.md`) as Promise<Post>,
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
