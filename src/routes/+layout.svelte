<script lang="ts">
    import Footer from "$lib/components/layout/Footer.svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import KeybindingsHelp from "$lib/components/KeybindingsHelp.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import Visualizer from "$lib/components/Visualizer/index.svelte";
    import * as ui from "$lib/stores/ui";
    import { settings } from "$lib/stores/settings.svelte";
    import { fade } from "svelte/transition";
    import { lanyard } from "$lib/stores/lanyard.svelte";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { stream, metadata, STATIONS } from "$lib/stores/nightride";
    import "../app.css";

    let { children } = $props();
    let audioElement: HTMLAudioElement | undefined = $state();

    stream.initEffects();

    const VOLUME_STEP = 0.05;

    function handleKeydown(e: KeyboardEvent) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
            return;
        }

        switch (e.key) {
            case "Escape":
                if (ui.misc.isHelpOpen) ui.misc.toggleHelp();
                if (ui.sidebar.isOpen) ui.sidebar.close();
                break;
            case "?":
                ui.misc.toggleHelp();
                break;
            case " ":
                e.preventDefault();
                stream.togglePlay();
                break;
            case "z":
                ui.misc.toggleZenMode();
                break;
            case "m":
                stream.toggleMute();
                break;
            case "s":
                ui.sidebar.toggle();
                break;
            case "+":
            case "=":
                settings.stream.volume = Math.min(1, settings.stream.volume + VOLUME_STEP);
                break;
            case "-":
                settings.stream.volume = Math.max(0, settings.stream.volume - VOLUME_STEP);
                break;
            case "n": {
                const idx = STATIONS.findIndex((s) => s.id === stream.currentStation.id);
                stream.setStation(STATIONS[(idx + 1) % STATIONS.length]);
                break;
            }
            case "p": {
                const idx = STATIONS.findIndex((s) => s.id === stream.currentStation.id);
                stream.setStation(STATIONS[(idx - 1 + STATIONS.length) % STATIONS.length]);
                break;
            }
            case "g":
                window.scrollTo({ top: 0, behavior: "smooth" });
                break;
            case "G":
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                break;
            case "b":
                if (page.url.pathname.startsWith("/blog/") && page.url.pathname !== "/blog/") {
                    goto("/blog/");
                }
                break;
        }
    }

    onMount(() => {
        lanyard.connect();
        metadata.connect();
        if (audioElement) stream.element = audioElement;

        return () => {
            lanyard.disconnect();
            metadata.disconnect();
        };
    });
</script>

<svelte:window onkeydown={handleKeydown} />

<Header />

<Sidebar />
<KeybindingsHelp />

<Visualizer analyser={stream.analyser} isPlaying={stream.isPlaying} />
<audio bind:this={audioElement} crossorigin="anonymous"></audio>

{#key page.url.pathname}
    {@const pathname = page.url.pathname}
    <main
        in:fade={{ duration: 400 }}
        class:blog={pathname === "/blog/"}
        class:centered={pathname === "/" || pathname === "/contact/"}
        class:padded={pathname.startsWith("/whoami") || pathname.startsWith("/blog") || pathname === "/settings/"}
        style:opacity={ui.misc.isZenMode ? 0 : 1}
        style:pointer-events={ui.misc.isZenMode ? "none" : "auto"}
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
