<script lang="ts">
    import Footer from "$lib/components/layout/Footer.svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import Visualizer from "$lib/components/Visualizer.svelte";
    import { audioState } from "$lib/stores/audio.svelte";
    import { ui } from "$lib/stores/ui.svelte";
    import { lanyard } from "$lib/stores/lanyard.svelte";
    import { nightride } from "$lib/stores/nightride.svelte";
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { onMount } from "svelte";

    let { children } = $props();
    let audioElement: HTMLAudioElement | undefined = $state();

    audioState.initEffects();

    function handleKeydown(e: KeyboardEvent) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
            return;
        }

        switch (e.key.toLowerCase()) {
            case "z":
                ui.toggleZenMode();
                break;
            case "m":
                audioState.toggleMute();
                break;
            case "h":
                audioState.togglePlay();
                break;
            case "s":
                ui.toggle();
                break;
        }
    }

    onMount(() => {
        lanyard.connect();
        nightride.connect();
        if (audioElement) audioState.element = audioElement;

        return () => {
            lanyard.disconnect();
            nightride.disconnect();
        };
    });
</script>

<Header />

<Sidebar />

<svelte:window onkeydown={handleKeydown} />

<Visualizer dimmed={!ui.isZenMode && page.url.pathname !== "/"} />
<audio bind:this={audioElement} crossorigin="anonymous"></audio>

{#key page.url.pathname}
    {@const pathname = page.url.pathname}
    <main
        in:fade={{ duration: 400 }}
        class:blog={pathname === "/blog/"}
        class:centered={pathname === "/" || pathname === "/contact/" || pathname === "/settings/"}
        class:padded={pathname.startsWith("/whoami") || pathname.startsWith("/blog")}
        style:opacity={ui.isZenMode ? 0 : 1}
        style:pointer-events={ui.isZenMode ? "none" : "auto"}
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

    :global {
        /* NOTE: Variables */
        :root {
            /* font */
            font-family: "Quantico", sans-serif;

            /* variables for layout */
            --header-height: 64px;
            --global-width: min(800px, 100% - 3rem);
            --radius: 4px;

            /* colorscheme */
            --bg-primary-light: #29292f;
            --bg-primary: #232329;
            --bg-primary-dark: #101012;

            --bg-transparent-light: #29292f80;
            --bg-transparent: #23232980;
            --bg-transparent-dark: #10101280;

            --bg-accent: #4b0202;

            --fg-primary-light: #ffffff;
            --fg-primary: #cdcdcd;
            --fg-primary-dark: #717171;
            --fg-accent: #675757;

            --border-primary: #4f4d4d;

            /* blog post specific colorschemes */
            --highlight: #717171;
        }

        /* NOTE Resets */
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        html {
            /* Fluid typography works great here */
            font-size: clamp(16px, 1.2vw + 12px, 20px);
            /* Prevents layout shift when scrollbars appear */
            scrollbar-gutter: stable;
        }

        body {
            color: var(--fg-primary);
            background-color: var(--bg-primary);
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            color: var(--fg-primary-light);
            line-height: 1;
            margin-bottom: 1rem;
            letter-spacing: 0.02em;
        }

        p {
            margin-bottom: 0.95rem;
            /* Limit line length for better readability */
            max-width: 80ch;
        }

        a {
            color: var(--fg-accent);
            text-underline-offset: 4px;
            transition: color 0.2s ease;

            &:hover {
                color: var(--fg-primary-light);
            }
        }

        li,
        ol {
            list-style-position: inside;
            margin-bottom: 0.5rem;
        }

        pre {
            padding: 16px;
            margin-bottom: 16px;
            border-radius: var(--radius);
            border: 1px solid var(--border-primary);
            overflow-x: auto;
            max-width: 100%;
        }

        code {
            color: var(--highlight);
            font-size: 0.78em;
            font-family: "JetBrains Mono", monospace;
        }

        span,
        button,
        select {
            font-family: "Quantico", sans-serif;
        }

        /* NOTE: Fonts */
        /* quantico-regular - latin */
        @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: "Quantico";
            font-style: normal;
            font-weight: 400;
            src: url("/fonts/quantico/quantico-v17-latin-regular.woff2") format("woff2"); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
        }
        /* quantico-italic - latin */
        @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: "Quantico";
            font-style: italic;
            font-weight: 400;
            src: url("/fonts/quantico/quantico-v17-latin-italic.woff2") format("woff2"); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
        }
        /* quantico-700 - latin */
        @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: "Quantico";
            font-style: normal;
            font-weight: 700;
            src: url("/fonts/quantico/quantico-v17-latin-700.woff2") format("woff2"); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
        }
        /* quantico-700italic - latin */
        @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: "Quantico";
            font-style: italic;
            font-weight: 700;
            src: url("/fonts/quantico/quantico-v17-latin-700italic.woff2") format("woff2"); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
        }
        /* jetbrains-mono-regular - latin */
        @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: "JetBrains Mono";
            font-style: normal;
            font-weight: 400;
            src: url("/fonts/jetbrains-mono/jetbrains-mono-v24-latin-regular.woff2") format("woff2"); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
        }
    }
</style>
