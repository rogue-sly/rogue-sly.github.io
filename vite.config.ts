import { mdsvex, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import rehypeSlug from "rehype-slug";
import rehypeTocExtract from "./src/lib/utils/rehype/toc-extract.js";
import relativeImages from "mdsvex-relative-images";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import Icons from "unplugin-icons/vite";

/** @type {import('shiki').BundledTheme} */ const theme = "kanagawa-dragon";

const highlighter = await createHighlighter({
    themes: [theme],
    /** @type {import('shiki').BundledLanguage[]} */ langs: [
        "bash",
        "json",
        "lua",
        "nix",
        "rust",
        "sh",
        "svelte",
        "toml",
        "typescript",
        "yaml",
    ],
});

/** @type {import('mdsvex').MdsvexOptions} */ const mdsvexOptions = {
    extensions: [".md"],
    rehypePlugins: [rehypeSlug, rehypeTocExtract],
    remarkPlugins: [relativeImages],
    highlight: {
        highlighter: async (code, lang = "text") => {
            const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));

            return `{@html \`${html}\` }`;
        },
    },
};

export default defineConfig({
    assetsInclude: ["**/*.cast"],
    plugins: [
        sveltekit({
            // Consult https://svelte.dev/docs/kit/integrations#preprocessors
            // for more information about preprocessors
            preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
            extensions: [".svelte", ".md"],
            // See https://svelte.dev/docs/kit/adapters for more information about adapters.
            adapter: adapter({
                pages: "build",
                assets: "build",
                fallback: "404.html",
                precompress: true,
                strict: true,
            }),
        }),
        Icons({ compiler: "svelte" }),
    ],
    esbuild: { treeShaking: true },
    optimizeDeps: { include: ["svelte", "@sveltejs/kit"] },
});
