<script lang="ts">
    import "../app.css";
    import * as ui from "$lib/stores/ui";
    import Footer from "$lib/components/layout/Footer.svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import { fade } from "svelte/transition";
    import { page } from "$app/state";

    let { children } = $props();
</script>

<Header />

<Sidebar />

{#await import("$lib/components/Visualizer/index.svelte") then { default: Visualizer }}
    <Visualizer />
{/await}

{#key page.url.pathname}
    {@const pathname = page.url.pathname}
    <main
        in:fade={{ duration: 400 }}
        class:blog={pathname === "/blog/"}
        class:centered={pathname === "/"}
        class:padded={pathname.startsWith("/whoami") ||
            pathname.startsWith("/blog") ||
            pathname === "/settings/"}
        style:opacity={ui.zenMode.isZenMode ? 0 : 1}
        style:pointer-events={ui.zenMode.isZenMode ? "none" : "auto"}
    >
        {@render children()}
    </main>
{/key}

<Footer />

<style>
    main {
        /* push content down so it's not hidden behind header */
        margin-top: var(--header-height);
        /* ensure footer stays at bottom */
        min-height: calc(100svh - var(--header-height));

        width: var(--global-width);
        margin-inline: auto;
        transition: opacity 0.4s ease;
    }

    main.centered {
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
