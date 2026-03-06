import type { ServerLoadEvent } from "@sveltejs/kit";
import { create } from "xmlbuilder2";
import { getAllPosts } from "$lib/utils/post";
import { url } from "$lib/data/site";
import { appErrorMessage } from "$lib/errors";

export const prerender = true;

export async function GET({}: ServerLoadEvent) {
    const postsResult = await getAllPosts();

    if (postsResult.isErr()) {
        console.error("Sitemap generation failed:", appErrorMessage(postsResult.error), postsResult.error);
        return new Response("Failed to generate sitemap", { status: 500 });
    }

    const posts = postsResult.value;
    const staticPages = ["", "whoami", "contact", "blog"];

    const root = create({ version: "1.0", encoding: "UTF-8" }).ele("urlset", {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
    });

    // 1. Static Pages
    // prettier-ignore
    for (const page of staticPages) {
        root.ele("url")
                .ele("loc").txt(`${url}${page === "" ? "" : `/${page}`}`).up()
                .ele("changefreq").txt("monthly").up()
                .ele("priority").txt(page === "" ? "1.0" : "0.8").up()
            .up();
    }

    // 2. Blog Posts
    // prettier-ignore
    for (const post of posts) {
        if (post.metadata.published === false) continue;

        root.ele("url")
                .ele("loc").txt(`${url}/blog/${post.postPath}`).up()
                .ele("lastmod").txt(post.metadata.date).up()
                .ele("changefreq").txt("monthly").up()
                .ele("priority").txt("0.7").up()
            .up();
    }

    const xml = root.end({ prettyPrint: true });

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "max-age=0, s-maxage=3600",
        },
    });
}
