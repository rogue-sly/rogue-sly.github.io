<script lang="ts">
    import Header from "$lib/layout/Header.svelte";
    import Footer from "$lib/layout/Footer.svelte";
    import "$lib/style/_index.css";
    import { fade } from "svelte/transition";
    import { page } from "$app/state";

    let { children } = $props();
</script>

<Header />

{#key page.url.pathname}
    <main in:fade={{ duration: 400 }}>
        {@render children()}
    </main>
{/key}

<Footer />

<style>
    main {
        margin-top: var(--header-height); /* push content down so it's not hidden behind header */
        min-height: calc(100svh - var(--header-height)); /* ensure footer stays at bottom */

        width: var(--global-width);
        margin-inline: auto;
        padding-block: 2rem;
    }
</style>
