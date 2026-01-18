<script lang="ts">
    import Activity from "./Activity.svelte";
    import { LanyardSocket, presenceData } from "../../stores/websocket.svelte";
    import gideon from "$lib/assets/images/gideon-animated.webp";
    import { title, author, url, desc } from "$lib/site-config";

    let customStatus = $derived($presenceData.activities?.find((a) => a.type === 4));
    let activities = $derived($presenceData.activities?.filter((a) => a.type !== 4));
    let isLoading = $derived(Object.keys($presenceData).length === 0);

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
        <img src={gideon} alt="gideon" />
        {#if customStatus}
            <div class="status-bubble">
                {#if customStatus.emoji}
                    {#if customStatus.emoji.id}
                        <img
                            src={`https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? "gif" : "png"}`}
                            alt={customStatus.emoji.name}
                            class="emoji"
                        />
                    {:else}
                        <span class="emoji">{customStatus.emoji.name}</span>
                    {/if}
                {/if}
                {#if customStatus.state}
                    <span class="status-text">{customStatus.state}</span>
                {/if}
            </div>
        {/if}
    </div>

    <h1>Hi there! my name is Rogue/Ac!d.</h1>

    <p class="intro">
        Yet another CS student. Trying to make something out of himself. Hope you find something that interests you
        here.
    </p>

    <Activity {activities} {isLoading} />
</section>

<style>
    .hero {
        min-height: calc(100svh - var(--header-height) - 4rem);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        width: 100%;
    }

    .pfp {
        position: relative;
        display: inline-block;
    }

    .status-bubble {
        position: absolute;
        top: -25px;
        transform: translateX(140px);
        background-color: var(--bg-primary-light);
        border: 2px solid var(--border-primary);
        border-radius: 16px;
        padding: 0.4rem 0.6rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        max-width: 250px;
        z-index: 20;
        transition: all 0.3s ease;
    }

    @media (max-height: 700px) {
        .status-bubble {
            top: auto;
            bottom: -20px;
        }
    }

    .status-bubble::before {
        content: "";
        position: absolute;
        bottom: -10px;
        left: 10px;
        width: 12px;
        height: 12px;
        background-color: var(--bg-primary-light);
        border: 2px solid var(--border-primary);
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    @media (max-height: 700px) {
        .status-bubble::before {
            bottom: auto;
            top: -10px;
            left: 10px;
        }
    }

    .status-bubble::after {
        content: "";
        position: absolute;
        bottom: -22px;
        left: -5px;
        width: 8px;
        height: 8px;
        background-color: var(--bg-primary-light);
        border: 2px solid var(--border-primary);
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    @media (max-height: 700px) {
        .status-bubble::after {
            bottom: auto;
            top: -22px;
            left: -5px;
        }
    }

    .status-bubble .emoji {
        object-fit: contain;
        font-size: 0.6rem;
    }

    .status-text {
        font-size: 0.6rem;
        font-weight: 500;
        color: var(--fg-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 20ch;
    }

    .pfp img {
        border-radius: 20px;
        border: 2px solid var(--fg-accent);
        object-fit: cover;
    }

    h1 {
        text-align: center;
        font-size: clamp(1.5rem, 5vw, 1.75rem);
        font-weight: 800;
        max-width: 20ch;
        margin: 0;
        letter-spacing: -0.02em;
    }

    .intro {
        text-align: center;
        line-height: 1.6;
        color: var(--fg-primary);
        max-width: 50ch;
        margin: 0;
        opacity: 0.9;
    }
</style>
