import type { PostMetadata } from "$lib/types";
import * as config from "$lib/data/site";
import { create } from "xmlbuilder2";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { JSDOM } from "jsdom";
import { readFile } from "fs/promises";
import { unified } from "unified";
import type { ServerLoadEvent } from "@sveltejs/kit";

export const prerender = true;

export async function GET({ fetch }: ServerLoadEvent) {
    const headers = {
        "Cache-Control": "max-age=0, s-maxage=3600",
        "Content-Type": "application/xml",
    };

    let xml: string;
    try {
        const response = await fetch("/api/posts.json");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const { posts } = await response.json();
        xml = await generateXml(posts);
    } catch (e) {
        console.error("RSS feed generation failed:", e);
        return new Response("Failed to generate RSS feed", { status: 500 });
    }

    return new Response(xml, { headers });
}

async function getHtmlForPost(
    postPath: string,
    leadImageFilename?: string,
    leadImageCaption?: string,
): Promise<string> {
    const postMarkdownWithFrontmatter = await readFile(`src/lib/data/posts/${postPath}/index.md`, "utf-8");
    const postMarkdown = postMarkdownWithFrontmatter.split("---").slice(2).join("---").trim();

    const processedMarkdown = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(postMarkdown);

    const postHtml = processedMarkdown.toString().replaceAll("&#x3C;", "&amp;lt;");

    const postDom = new JSDOM();
    postDom.window.document.body.innerHTML = postHtml;

    inlineFootnotes(postDom);

    if (leadImageFilename) {
        const leadImage = postDom.window.document.createElement("img");
        leadImage.src = leadImageFilename;
        if (leadImageCaption) {
            const caption = postDom.window.document.createElement("caption");
            caption.textContent = leadImageCaption;
            postDom.window.document.body.prepend(caption);
        }
    }

    return postDom.window.document.body.innerHTML;
}

// prettier-ignore
async function generateXml(posts: PostMetadata[]): Promise<string> {
    const rssUrl = `${config.url}/rss.xml`;
    const root = create({ version: "1.0", encoding: "utf-8" })
        .ele("feed", { xmlns: "http://www.w3.org/2005/Atom" })
            .ele("title").txt(config.title).up()
            .ele("link", { href: config.url }).up()
            .ele("link", { rel: "self", href: rssUrl }).up()
            .ele("updated").txt(new Date().toISOString()).up()
            .ele("id").txt(config.url).up()
            .ele("author")
                .ele("name").txt(config.author).up()
                .ele("email").txt(config.email).up()
            .up()
            .ele("subtitle").txt(config.desc).up();

    for (const post of posts) {
        const postHtml = await getHtmlForPost(post.slug, post.image, post.caption);
        const pubDate = post.date;
        const postUrl = `${config.url}/blog/${post.slug}`;
        const summary = post.desc;

        root.ele("entry")
            .ele("title").txt(post.title).up()
            .ele("link", { href: postUrl }).up()
            .ele("updated").txt(pubDate).up()
            .ele("id").txt(postUrl).up()
            .ele("content", { type: "html" }).txt(postHtml).up()
            .ele("summary").txt(summary).up()
        .up();
    }

    return root.end();
}

function inlineFootnotes(dom: JSDOM): void {
    const footnoteLinkPrefix = "#user-content-fn-";
    const prefixToRemove = "#user-content-";
    const allLinks = Array.from(dom.window.document.getElementsByTagName("a"));
    allLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href?.startsWith(footnoteLinkPrefix)) {
            const newFootnoteHref = "#" + href.slice(prefixToRemove.length);
            const footnoteContentElem = dom.window.document.getElementById(href.slice(1)) as HTMLLIElement | null;
            footnoteContentElem?.setAttribute("id", newFootnoteHref.slice(1));
            link.setAttribute("href", newFootnoteHref);
        }
    });
}
