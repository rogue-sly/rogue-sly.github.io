import { ResultAsync } from "neverthrow";
import type { PostMetadata, PostLink } from "$lib/types";
import type { AppError } from "$lib/errors";

export function getAllPosts(): ResultAsync<PostLink[], AppError> {
    const pathPrefix = "../../data/posts/";
    const allPostFiles = import.meta.glob("../../data/posts/*.md");
    const iterablePostFiles = Object.entries(allPostFiles);

    const postJobs: ResultAsync<PostLink, AppError>[] = iterablePostFiles.map(([path, resolver]) =>
        ResultAsync.fromPromise(
            (resolver() as Promise<{ metadata: PostMetadata }>).then((mod) => {
                const postPath = path.replace(pathPrefix, "").replace(".md", "");
                return { metadata: mod.metadata, postPath } satisfies PostLink;
            }),
            (cause): AppError => ({ type: "POST_LOAD_ERROR", path, cause }),
        ),
    );

    return ResultAsync.combine(postJobs).map((posts) => {
        posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
        return posts;
    });
}
