import * as config from "$lib/data/site";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { create } from "xmlbuilder2";
import { getAllPosts } from "$lib/utils/post";
import { ResultAsync } from "neverthrow";
import type { AppError } from "$lib/errors";
import { appErrorMessage } from "$lib/errors";

import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { JSDOM } from "jsdom";
import { readFile } from "fs/promises";
import { unified } from "unified";

export const prerender = true;

export async function GET({}: ServerLoadEvent) {
    const headers = {
        "Cache-Control": "max-age=0, s-maxage=3600",
        "Content-Type": "application/xml",
    };

    const result = await generateXml();

    if (result.isErr()) {
        console.error("RSS feed generation failed:", appErrorMessage(result.error), result.error);
        return new Response("Failed to generate RSS feed", { status: 500 });
    }

    return new Response(result.value, { headers });
}

function getHtmlForPost(
    postPath: string,
    leadImageFilename?: string,
    leadImageCaption?: string,
): ResultAsync<string, AppError> {
    return ResultAsync.fromPromise(
        readFile(`src/lib/data/posts/${postPath}.md`, "utf-8").then(async (postMarkdownWithFrontmatter) => {
            const postMarkdown = postMarkdownWithFrontmatter.split("---").slice(2).join("---").trim();

            const processedMarkdown = await unified()
                .use(remarkParse)
                .use(remarkRehype)
                .use(rehypeStringify)
                .use(remarkGfm)
                .process(postMarkdown);

            const postHtml = processedMarkdown.toString().replaceAll("&#x3C;", "&amp;lt;");

            const postDom = new JSDOM();
            postDom.window.document.body.innerHTML = postHtml;

            inlineFootnotes(postDom);

            if (leadImageFilename) {
                const leadImage = postDom.window.document.createElement("img");
                // @ts-ignore - resolve is typed for routes but works for assets too
                leadImage.src = resolve(leadImageFilename);
                if (leadImageCaption) {
                    const caption = postDom.window.document.createElement("caption");
                    caption.textContent = leadImageCaption;
                    postDom.window.document.body.prepend(caption);
                }
            }

            return postDom.window.document.body.innerHTML;
        }),
        (cause): AppError => ({ type: "POST_LOAD_ERROR", path: postPath, cause }),
    );
}

// prettier-ignore
async function generateXml() {
    const postsResult = await getAllPosts();
    if (postsResult.isErr()) return postsResult;

    const posts = postsResult.value;
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
        if (!post.metadata.published) continue;

        const htmlResult = await getHtmlForPost(post.postPath, post.metadata.image, post.metadata.caption);
        if (htmlResult.isErr()) return htmlResult;

        const pubDate = post.metadata.date;
        const postUrl = `${config.url}/blog/${post.postPath}`;
        const postHtml = htmlResult.value;
        const summary = post.metadata.desc;

        root.ele("entry")
                .ele("title").txt(post.metadata.title).up()
                .ele("link", { href: postUrl }).up()
                .ele("updated").txt(pubDate).up()
                .ele("id").txt(postUrl).up()
                .ele("content", { type: "html" }).txt(postHtml).up()
                .ele("summary").txt(summary).up()
            .up();
    }

    return postsResult.map(() => root.end());
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
