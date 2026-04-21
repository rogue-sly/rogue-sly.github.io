import { json } from "@sveltejs/kit";
import type { PostMetadata } from "$lib/types";
import { dev } from "$app/environment";

export const prerender = true;

export async function GET() {
    try {
        const posts = getPosts();
        return json({ posts });
    } catch (error) {
        console.error("Failed to build posts:", error);
        return new Response("Failed to load posts", { status: 500 });
    }
}

function getPosts(): PostMetadata[] {
    const posts: PostMetadata[] = [];
    const paths = import.meta.glob("$lib/data/posts/*/index.md", { eager: true });

    for (const path in paths) {
        const file = paths[path];

        const pathParts = path.split("/");
        const slug = pathParts.at(-2);

        if (file && typeof file === "object" && "metadata" in file && slug) {
            const metadata = file.metadata as Omit<PostMetadata, "slug">;
            const post = { ...metadata, slug } satisfies PostMetadata;

            if (post.published || dev) posts.push(post);
        }
    }

    return posts.sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());
}
