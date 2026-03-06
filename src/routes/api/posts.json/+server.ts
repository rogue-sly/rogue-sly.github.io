import { json } from "@sveltejs/kit";
import { Result } from "neverthrow";
import type { PostMetadata } from "$lib/types";
import type { AppError } from "$lib/errors";
import { appErrorMessage } from "$lib/errors";

export async function GET() {
    const result = getPosts();

    if (result.isErr()) {
        console.error("Failed to build posts list:", appErrorMessage(result.error), result.error);
        return new Response("Failed to load posts", { status: 500 });
    }

    return json(result.value);
}

function getPosts(): Result<PostMetadata[], AppError> {
    return Result.fromThrowable(
        () => {
            let posts: PostMetadata[] = [];

            const paths = import.meta.glob("/src/lib/data/posts/*.md", { eager: true });

            for (const path in paths) {
                const file = paths[path];
                const slug = path.split("/").at(-1)?.replace(".md", "");

                if (file && typeof file === "object" && "metadata" in file && slug) {
                    const metadata = file.metadata as Omit<PostMetadata, "slug">;
                    const post = { ...metadata, slug } satisfies PostMetadata;
                    if (post.published) posts.push(post);
                }
            }

            posts = posts.sort(
                (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
            );

            return posts;
        },
        (cause): AppError => ({ type: "POSTS_LOAD_ERROR", cause }),
    )();
}
