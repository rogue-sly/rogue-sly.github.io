<script lang="ts">
    import SEO from "$lib/components/SEO.svelte";
    import Card from "./Card.svelte";
</script>

<SEO title="Projects" desc="A showcase of my personal projects." />

<div class="projects-grid">
    <Card
        title="Personal Website"
        description="My personal portfolio and blog built with SvelteKit and Svelte 5 Runes."
        techStack={["SvelteKit 5", "TypeScript", "Static Website"]}
        links={{
            repo: "https://gitlab.com/rogue-sly/rogue-sly.gitlab.io",
            live: "https://rogue-sly.gitlab.io",
        }}
    />

    <Card
        title="Dotbee"
        description="Easy to use dotfiles manager"
        techStack={["Rust"]}
        links={{
            repo: "https://gitlab.com/rogue-sly/dotbee",
        }}
    />

    <Card
        title="inlyne.nvim"
        description="A neovim plugin wrapper for inlyne (a browserless markdown viewer)"
        techStack={["Lua", "Neovim"]}
        links={{
            repo: "https://github.com/rogue-sly/inlyne.nvim",
        }}
    />
</div>

<style>
    .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
    }
</style>
