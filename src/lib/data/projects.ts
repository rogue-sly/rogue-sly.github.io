import type { Project } from "$lib/types";

export const projects: Project[] = [
    {
        title: "Personal Website",
        description: "My personal portfolio and blog built with SvelteKit and Svelte 5 Runes.",
        techStack: ["SvelteKit 5", "TypeScript", "Static Website"],
        links: {
            repo: "https://github.com/rogue87/rogue87.github.io",
            live: "https://rogue87.gitlab.io",
        },
    },
    {
        title: "Dotsy",
        description: "A dotfiles manager to keep your configuration files organized and synchronized.",
        techStack: ["Rust"],
        links: {
            repo: "https://gitlab.com/rogue87/dotsy",
        },
    },
    {
        title: "inlyne.nvim",
        description: "A neovim plugin wrapper for inlyne (a browserless markdown viewer)",
        techStack: ["Lua", "Neovim"],
        links: {
            repo: "https://github.com/rogue-87/inlyne.nvim",
        },
    },
];
