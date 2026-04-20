import type { PageLoadEvent } from "./$types";
import type { PostMetadata } from "$lib/types";
import { error } from "@sveltejs/kit";

export async function load({ fetch }: PageLoadEvent) {
    const posts = await fetch("/api/posts.json").then((response) => {
        if (!response.ok) return error(response.status, { message: "Failed to load posts" });

        const json = response.json().then((data: PostMetadata[]) => data);
        return json;
    });

    return { posts };
}
