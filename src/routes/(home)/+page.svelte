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
        <div class="thought-container">
            <div class="status-bubble" class:loading={isLoading}>
                {#if isLoading}
                    <span class="status-text">🧠  Thinking...</span>
                {:else if customStatus}
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
                {:else}
                    <span class="status-text">💤 Just vibing...</span>
                {/if}
            </div>
            <div class="bubble-dot dot-1"></div>
            <div class="bubble-dot dot-2"></div>
            <div class="bubble-dot dot-3"></div>
        </div>
        <img src={gideon} alt="gideon" />
    </div>

    <h1>Hi there! my name is Ali, but you can call me Rogue</h1>

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
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        position: relative;
    }

    .thought-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: float 5s ease-in-out infinite;
        z-index: 2;
        /* Ensure the bubbles don't overlap the image too much if they dip low */
        margin-bottom: 0.5rem;
    }

    .status-bubble {
        background-color: var(--bg-primary-light);
        border: 2px solid var(--border-primary);
        border-radius: 20px;
        padding: 0.5rem 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        max-width: 240px;
        min-height: 40px;
    }

    .status-bubble.loading {
        opacity: 0.7;
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 0.5;
        }
        50% {
            opacity: 1;
        }
    }

    .bubble-dot {
        position: absolute;
        background-color: var(--bg-primary-light);
        border: 2px solid var(--border-primary);
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .dot-1 {
        width: 14px;
        height: 14px;
        bottom: -10px;
        left: 50%;
        transform: translateX(-68px);
    }

    .dot-2 {
        width: 10px;
        height: 10px;
        bottom: -22px;
        left: 50%;
        transform: translateX(-68px);
    }

    .dot-3 {
        width: 8px;
        height: 8px;
        bottom: -32px;
        left: 50%;
        transform: translateX(-60px);
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-8px);
        }
    }

    @media (max-width: 480px) {
        .status-bubble {
            max-width: 180px;
            padding: 0.4rem 0.7rem;
        }

        .pfp img {
            width: 120px;
            height: 120px;
        }
    }

    .status-bubble .emoji {
        width: 1.25rem;
        height: 1.25rem;
        object-fit: contain;
    }

    span.emoji {
        font-size: 1.1rem;
        line-height: 1;
    }

    .status-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--fg-primary-light);
        word-break: break-word;
        line-height: 1.3;
    }

    .pfp img {
        width: 150px;
        height: 150px;
        border-radius: 24px;
        border: 3px solid var(--fg-accent);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
