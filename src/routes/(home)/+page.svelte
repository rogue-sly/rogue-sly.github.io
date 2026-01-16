<script lang="ts">
    import Activity from "$lib/components/Activity.svelte";
    import { LanyardSocket, presenceData } from "../../stores/websocket.svelte";
    import gideon from "$lib/assets/images/gideon-animated.webp";
    import { title, author, url, desc } from "$lib/site-config";

    let customStatus = $derived($presenceData.activities?.find((a) => a.type === 4));
    let carouselActivities = $derived($presenceData.activities?.filter((a) => a.type !== 4));
    let isLoading = $derived(Object.keys($presenceData).length === 0);

    let carouselContainer: HTMLElement | undefined = $state();

    function scrollCarousel(direction: number) {
        if (carouselContainer) {
            const scrollAmount = carouselContainer.clientWidth;
            carouselContainer.scrollBy({
                left: direction * scrollAmount,
                behavior: "smooth",
            });
        }
    }

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
        Yet another CS student. Trying to make something out of himself. Hope you find something
        that interests you here.
    </p>

    <div class="carousel-wrapper">
        {#if isLoading}
            <div class="activity-skeleton">
                <div class="skeleton-icon"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>
        {:else if carouselActivities && carouselActivities.length > 0}
            <button
                onclick={() => scrollCarousel(-1)}
                class="nav-btn prev"
                aria-label="Previous Activity"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
                >
            </button>

            <div class="activity-carousel" bind:this={carouselContainer}>
                {#each carouselActivities as activity (activity.id)}
                    <div class="carousel-item">
                        <Activity {activity} />
                    </div>
                {/each}
            </div>

            <button
                onclick={() => scrollCarousel(1)}
                class="nav-btn next"
                aria-label="Next Activity"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
                >
            </button>
        {:else}
            <div class="empty-state">
                <p>Not doing anything right now...</p>
            </div>
        {/if}
    </div>
</section>

<style>
    .activity-carousel {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        width: 100%;
        margin: auto;
        overflow-x: auto;
        scrollbar-width: none;
        align-items: center;
        scroll-snap-type: x mandatory;
        box-sizing: border-box;
        scroll-behavior: smooth;
    }

    .carousel-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        gap: 0.5rem;
    }

    .nav-btn {
        background: var(--bg-primary-light);
        border: none;
        color: var(--fg-primary);
        cursor: pointer;
        padding: 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        opacity: 0.7;
    }

    .nav-btn:hover {
        background-color: var(--fg-accent);
        color: var(--bg-primary);
        opacity: 1;
        transform: scale(1.1);
    }

    .nav-btn:active {
        transform: scale(0.95);
    }

    .activity-carousel::-webkit-scrollbar {
        display: none;
    }

    .carousel-item {
        flex: 0 0 100%;
        width: 100%;
        min-width: 100%;
        scroll-snap-align: center;
    }

    .activity-skeleton {
        display: flex;
        background-color: var(--bg-primary-dark);
        height: 100px;
        border-radius: 16px;
        width: 90%;
        align-items: center;
        padding: 8px;
        gap: 1rem;
        animation: pulse 1.5s infinite ease-in-out;
    }

    .skeleton-icon {
        width: 80px;
        height: 80px;
        background-color: var(--bg-primary);
        border-radius: 12px;
        flex-shrink: 0;
    }

    .skeleton-content {
        display: flex;
        flex-direction: column;
        gap: 0.50rem;
        flex: 1;
    }

    .skeleton-line {
        height: 12px;
        background-color: var(--bg-primary);
        border-radius: 6px;
        width: 60%;
    }
    .skeleton-line.short {
        width: 40%;
    }

    @keyframes pulse {
        0% {
            opacity: 0.6;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0.6;
        }
    }

    .empty-state {
        width: 100%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-primary-dark);
        border-radius: 16px;
        color: var(--fg-primary-dark);
        font-style: italic;
    }

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
