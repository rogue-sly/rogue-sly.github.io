<script lang="ts">
    import Footer from "$lib/components/layout/Footer.svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import Visualizer from "$lib/components/Visualizer.svelte";
    import { audioState } from "$lib/stores/audio.svelte";
    import { lanyard } from "$lib/stores/lanyard.svelte";
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import "./layout.css";

    let { children } = $props();
    let audioElement: HTMLAudioElement | undefined = $state();

    onMount(() => {
        lanyard.connect();
        if (audioElement) audioState.element = audioElement;
    });
</script>

<Header />

<Sidebar />

<Visualizer dimmed={page.url.pathname !== "/"} />

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

<audio bind:this={audioElement} crossorigin="anonymous"></audio>

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
