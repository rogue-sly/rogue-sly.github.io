import type { PostMetadata } from "#lib/types.js";
import { dev } from "$app/env";
import { resolveRelativeImage } from "#lib/utils/resolve-image.js";

export const prerender = true;

const postImages = import.meta.glob<string>("#lib/data/posts/*/assets/**/*.{png,jpg,jpeg,gif,svg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
});

export async function GET() {
    try {
        const posts = getPosts();
        return Response.json({ posts });
    } catch (e) {
        console.error("Failed to build posts:", e);
        return new Response("Failed to load posts", { status: 500 });
    }
}
function getPosts(): PostMetadata[] {
    const posts: PostMetadata[] = [];
    const paths = import.meta.glob("#lib/data/posts/*/index.md", { eager: true });

    for (const path in paths) {
        const file = paths[path];
        const pathParts = path.split("/");
        const slug = pathParts.at(-2);

        if (file && typeof file === "object" && "metadata" in file && slug) {
            const metadata = file.metadata as Omit<PostMetadata, "slug">;
            const post = { ...metadata, slug } satisfies PostMetadata;

            post.image = resolveRelativeImage(postImages, slug, post.image ?? "");
            if (post.published || dev) posts.push(post);
        }
    }

    return posts.sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());
}
