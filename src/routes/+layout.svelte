<script lang="ts">
    import Header from "$lib/layout/Header.svelte";
    import Footer from "$lib/layout/Footer.svelte";
    import Sidebar from "$lib/layout/Sidebar.svelte";
    import { audioState } from "$lib/stores/audio.svelte";
    import "$lib/style/_index.css";
    import { fade } from "svelte/transition";
    import { page } from "$app/state";

    let { children } = $props();
</script>

<Header />

<Sidebar />

{#key page.url.pathname}
    <main
        in:fade={{ duration: 400 }}
        class:blog={page.url.pathname === "/blog/"}
        class:center={page.url.pathname === "/" || page.url.pathname === "/contact/"}
        class:padded={page.url.pathname.startsWith("/whoami") || page.url.pathname.startsWith("/blog")}
    >
        {@render children()}
    </main>
{/key}

<Footer />

<audio bind:this={audioState.element} crossorigin="anonymous"></audio>

<style>
    main {
        margin-top: var(--header-height); /* push content down so it's not hidden behind header */
        min-height: calc(100svh - var(--header-height)); /* ensure footer stays at bottom */

        width: var(--global-width);
        margin-inline: auto;
    }

    main.center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    main.padded {
        padding-block: 2rem;
    }

    main.blog {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
</style>
