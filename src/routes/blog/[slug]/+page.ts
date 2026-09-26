import { error } from "@sveltejs/kit";
import type { PageLoadEvent } from "./$types";
import type { PostMetadata } from "#lib/types.js";
import { resolveRelativeImage } from "#lib/utils/resolve-image.js";

type Post = { default: () => any; metadata: PostMetadata };

const posts: Record<string, () => Promise<Post>> = {};
for (const [path, load_post] of Object.entries(import.meta.glob<Post>("#lib/data/posts/*/index.md"))) {
    const slug = path.split("/").at(-2);
    if (slug) posts[slug] = load_post as () => Promise<Post>;
}

const postImages = import.meta.glob<string>("#lib/data/posts/*/assets/**/*.{png,jpg,jpeg,gif,svg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
});

export async function load({ params }: PageLoadEvent) {
    const slug = params.slug ?? "";

    const load_post = posts[slug];
    if (!load_post) {
        throw error(404, `Could not find post: ${slug}`, { errorType: "POST_NOT_FOUND" });
    }
    const post = await load_post();

    // resolve relative banner image path
    const metadata = { ...post.metadata };
    metadata.image = resolveRelativeImage(postImages, slug, metadata.image ?? "");

    return { content: post.default, meta: metadata };
}
