import { error } from "@sveltejs/kit";
import type { PageLoadEvent } from "./$types";
import type { PostMetadata } from "#lib/types.js";

export async function load({ fetch }: PageLoadEvent) {
    const response = await fetch("/api/posts.json");
    if (!response.ok) {
        throw error(response.status, "Failed to load posts.");
    }

    const { posts }: { posts: PostMetadata[] } = await response.json();

    return { posts };
}
