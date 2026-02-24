import type { Project } from "$lib/types";

export const projects: Project[] = [
    {
        title: "Personal Website",
        description: "My personal portfolio and blog built with SvelteKit and Svelte 5 Runes.",
        techStack: ["SvelteKit 5", "TypeScript", "Static Website"],
        links: {
            repo: "https://gitlab.com/rogue87/rogue87.gitlab.io",
            live: "https://rogue87.gitlab.io",
        },
    },
    {
        title: "Dotbee",
        description: "Easy to use dotfiles manager",
        techStack: ["Rust"],
        links: {
            repo: "https://gitlab.com/rogue87/dotbee",
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
