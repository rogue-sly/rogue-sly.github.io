<script lang="ts">
    import "../app.css";
    import * as ui from "$lib/stores/ui";
    import Footer from "$lib/components/layout/Footer.svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import Radio from "$lib/components/layout/Radio.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import { NightrideRadio } from "$lib/stores/nightride";
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { settings } from "$lib/stores/settings.svelte";

    let { children } = $props();

    const nightride = new NightrideRadio(settings);
    onMount(() => {
        nightride.connect();
        return () => nightride.disconnect();
    });
</script>

<Header />

<Sidebar />

{#await import("$lib/components/Visualizer/index.svelte") then { default: Visualizer }}
    <Visualizer
        analyser={nightride.stream.analyser}
        isPlaying={nightride.stream.isPlaying}
    />
{/await}

{#key page.url.pathname}
    {@const pathname = page.url.pathname}
    <main
        in:fade={{ duration: 400 }}
        class:blog={pathname === "/blog/"}
        class:centered={pathname === "/" || pathname === "/contact/"}
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

<Radio {nightride} />

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
