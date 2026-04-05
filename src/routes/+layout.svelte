<script lang="ts">
    import Footer from "$lib/components/layout/Footer.svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import KeybindingsHelp from "$lib/components/layout/KeybindingsHelp.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import * as ui from "$lib/stores/ui";
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { StreamStore, MetadataStore } from "$lib/stores/nightride";
    import "../app.css";
    import { SettingsStore } from "$lib/stores/settings.svelte";

    let { children } = $props();
    let audioElement: HTMLAudioElement | undefined = $state();

    const settings = new SettingsStore();
    const stream = new StreamStore(settings);
    const metadata = new MetadataStore();

    stream.initEffects();

    onMount(() => {
        metadata.connect();
        if (audioElement) stream.element = audioElement;

        return () => {
            metadata.disconnect();
        };
    });
</script>

<Header />

<Sidebar {stream} {metadata} />

<KeybindingsHelp {stream} />

{#await import("$lib/components/Visualizer/index.svelte") then { default: Visualizer }}
    <Visualizer analyser={stream.analyser} isPlaying={stream.isPlaying} />
{/await}
<audio bind:this={audioElement} crossorigin="anonymous"></audio>

{#key page.url.pathname}
    {@const pathname = page.url.pathname}
    <main
        in:fade={{ duration: 400 }}
        class:blog={pathname === "/blog/"}
        class:centered={pathname === "/" || pathname === "/contact/"}
        class:padded={pathname.startsWith("/whoami") || pathname.startsWith("/blog") || pathname === "/settings/"}
        style:opacity={ui.zenMode.isZenMode ? 0 : 1}
        style:pointer-events={ui.zenMode.isZenMode ? "none" : "auto"}
    >
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
