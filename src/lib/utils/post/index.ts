import type { PostMetadata, PostLink } from "$lib/types";

export async function getAllPosts(): Promise<PostLink[]> {
    const pathPrefix = "../../data/posts/";
    const allPostFiles = import.meta.glob("../../data/posts/*/index.md");
    const iterablePostFiles = Object.entries(allPostFiles);

    const postJobs = iterablePostFiles.map(async ([path, resolver]) => {
        const mod = await (resolver() as Promise<{ metadata: PostMetadata }>);
        const postPath = path.replace(pathPrefix, "").replace(".md", "");
        return { metadata: mod.metadata, postPath } satisfies PostLink;
    });

    const posts = await Promise.all(postJobs);
    posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
    return posts;
}
