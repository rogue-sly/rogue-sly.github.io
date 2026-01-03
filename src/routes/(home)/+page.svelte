<script>
    import Spotify from "./Spotify.svelte";
    import { LanyardSocket } from "../../stores/websocket.svelte";
    import gideon from "$lib/assets/images/gideon-animated.webp";
    import { title, author, url, desc } from "$lib/site-config";

    $effect(() => {
        const socket = new LanyardSocket("369982847496355841");

        socket.connect();

        return () => {
            socket.disconnect();
        };
    });
</script>

<svelte:head>
    <title>home</title>

    <meta property="author" content={author} />
    <meta name="description" content={desc} />

    <meta property="og:title" content={title} />
    <meta property="og:site_name" content={author} />
    <meta property="og:description" content={desc} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content="/images/gideon-graves.png" />
</svelte:head>

<section class="hero">
    <div class="pfp">
        <img src={gideon} alt="gideon" width="125px" height="125px" />
    </div>

    <h1>Hi there 👋, my name is Rogue/Ac!d.</h1>

    <p class="intro">
        Yet another CS student. Trying to make something out of himself. Hope you find something
        that interests you here.
    </p>

    <Spotify />
</section>

<style>
    .hero {
        /* min-height matches layout but removes extra scroll padding */
        min-height: calc(100svh - var(--header-height) - 4rem); 
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center; /* Centers the whole block */
        gap: 2rem;
    }

    .pfp img {
        border-radius: 20px; /* Slightly more rounded for a modern feel */
        border: 2px solid var(--fg-accent);
        /* Use object-fit if your images aren't perfectly square */
        object-fit: cover; 
    }

    h1 {
        text-align: center;
        font-size: clamp(1.5rem, 5vw, 2.5rem); /* Fluid size for mobile/desktop */
        font-weight: 800; /* Bold headers look great with Inter/Archivo */
        line-height: 1.2;
        max-width: 20ch; /* Prevents the header from being too wide */
        margin: 0;
        letter-spacing: -0.02em; /* Tighter tracking makes large text look "pro" */
    }

    .intro {
        text-align: center;
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--fg-primary);
        max-width: 50ch; /* The magic number for easy-to-read intro text */
        margin: 0;
        opacity: 0.9; /* Slight reduction in contrast helps eye strain */
    }
</style>
