import { error } from "@sveltejs/kit";
import type { PageLoadEvent } from "./$types";
import type { PostMetadata } from "$lib/types";
import { resolveRelativeImage } from "$lib/utils/resolve-image";

type Post = { default: () => any; metadata: PostMetadata };

const postImages = import.meta.glob<string>("$lib/data/posts/*/assets/**/*.{png,jpg,jpeg,gif,svg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
});

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

    // resolve relative banner image path
    const metadata = { ...post.metadata };
    metadata.image = resolveRelativeImage(postImages, slug, metadata.image ?? "");

    return { content: post.default, meta: metadata };
}
