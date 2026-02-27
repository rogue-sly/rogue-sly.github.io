import type { PostMetadata, PostLink, TocItem } from "$lib/types";

type DateStyle = Intl.DateTimeFormatOptions["dateStyle"];
export function formatDate(date: string, dateStyle: DateStyle = "long", locales = "en") {
    // damn you safari
    const properDate = new Date(date.replaceAll("-", "/"));
    const dateFmt = new Intl.DateTimeFormat(locales, { dateStyle });

    return dateFmt.format(properDate);
}

export type TocStateItem = TocItem & {
    children: TocStateItem[];
};

export function createHeadings(toc: TocItem[]): TocStateItem[] {
    const stack: TocStateItem[] = [];
    const roots: TocStateItem[] = [];

    // Map incoming items to state items
    const nodes: TocStateItem[] = toc.map((item) => ({
        ...item,
        children: [],
    }));

    for (const node of nodes) {
        while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
            stack.pop();
        }
        if (stack.length > 0) {
            stack[stack.length - 1].children.push(node);
        } else {
            roots.push(node);
        }
        stack.push(node);
    }

    return roots;
}

export async function getAllPosts(): Promise<PostLink[]> {
    const pathPrefix = "./data/posts/";
    const allPostFiles = import.meta.glob("./data/posts/*.md");
    const iterablePostFiles = Object.entries(allPostFiles);
    const postJobs = iterablePostFiles.map(async ([path, resolver]) => {
        const { metadata } = (await resolver()) as { metadata: PostMetadata };
        const postPath = path.replace(pathPrefix, "").replace(".md", "");
        return { metadata, postPath };
    });
    const posts = await Promise.all(postJobs);
    posts.sort((a, b) => {
        const dateA = new Date(a.metadata.date);
        const dateB = new Date(b.metadata.date);
        return dateB.getTime() - dateA.getTime();
    });
    return posts;
}
