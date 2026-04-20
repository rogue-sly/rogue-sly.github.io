import { error } from "@sveltejs/kit";

import type { PageLoadEvent } from "./$types";
import type { PostMetadata } from "$lib/types";

type Post = { default: () => any; metadata: PostMetadata };

export async function load({ params }: PageLoadEvent) {
    const slug = params.slug ?? "";

    let post: Post;

    try {
        post = await import(`$lib/data/posts/${slug}/index.md`);
    } catch {
        throw error(404, {
            message: `Could not find post: ${slug}`,
            errorType: "POST_NOT_FOUND",
        });
    }

    return {
        content: post.default,
        meta: post.metadata,
    };
}
