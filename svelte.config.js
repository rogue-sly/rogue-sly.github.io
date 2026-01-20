import { mdsvex, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('shiki').BundledTheme} */
const theme = "kanagawa-dragon";
const highlighter = await createHighlighter({
    themes: [theme],
    /** @type {import('shiki').BundledLanguage[]} */
    langs: [
        "c",
        "c++",
        "html",
        "java",
        "javascript",
        "json",
        "lua",
        "luau",
        "nix",
        "rust",
        "sh",
        "svelte",
        "toml",
        "typescript",
    ],
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
    extensions: [".md"],
    highlight: {
        highlighter: async (code, lang = "text") => {
            const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: theme }));
            return `{@html \`${html}\` }`;
        },
    },
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations#preprocessors
    // for more information about preprocessors
    preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
    kit: {
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter({
            pages: "public",
            assets: "public",
            fallback: undefined,
            precompress: false,
            strict: true,
        }),
    },
    extensions: [".svelte", ".md"],
};

export default config;
