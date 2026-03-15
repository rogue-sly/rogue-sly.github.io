<script lang="ts">
    import Footer from "$lib/components/layout/Footer.svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import KeybindingsHelp from "$lib/components/KeybindingsHelp.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import * as ui from "$lib/stores/ui";
    import { keybindings } from "$lib/stores/ui/keybindings.svelte";
    import { fade } from "svelte/transition";
    import { lanyard } from "$lib/stores/lanyard.svelte";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { stream, metadata } from "$lib/stores/nightride";
    import "../app.css";

    let { children } = $props();
    let audioElement: HTMLAudioElement | undefined = $state();

    stream.initEffects();

    function handleKeydown(e: KeyboardEvent) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
            return;
        }

        const binding = keybindings.find((kb) => kb.key === e.key);
        if (binding) {
            if (binding.key === " ") e.preventDefault();
            binding.action();
        }
    }

    onMount(() => {
        metadata.connect();
        if (audioElement) stream.element = audioElement;

        return () => {
            metadata.disconnect();
        };
    });
</script>

<svelte:window onkeydown={handleKeydown} />

<Header />

<Sidebar />
<KeybindingsHelp />

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
