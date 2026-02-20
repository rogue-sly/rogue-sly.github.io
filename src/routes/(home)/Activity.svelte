<script lang="ts">
    import type { Activity } from "$lib/types";

    type ActivityComponent = { activities: Activity[] | undefined; isLoading: boolean };
    let { activities, isLoading }: ActivityComponent = $props();

    function getImageUrl(appId: string | undefined, assetId: string | undefined) {
        if (!assetId || !appId) return null;

        switch (true) {
            case assetId.startsWith("mp:"):
                return `https://media.discordapp.net/${assetId.replace("mp:", "")}`;
            case assetId.startsWith("spotify:"):
                return `https://i.scdn.co/image/${assetId.replace("spotify:", "")}`;
            default:
                return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
        }
    }

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
</script>

<div class="carousel-wrapper">
    <button
        onclick={() => scrollCarousel(-1)}
        class="nav-btn prev"
        aria-label="Previous Activity"
        disabled={!activities || activities.length === 0 || isLoading}
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
        {#if isLoading}
            <div class="carousel-item">
                <div class="activity-skeleton">
                    <div class="skeleton-icon"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line short"></div>
                    </div>
                </div>
            </div>
        {:else if activities && activities.length > 0}
            {#each activities as activity (activity.id)}
                {@const largeImage = getImageUrl(activity.application_id, activity.assets?.large_image)}
                {@const smallImage = getImageUrl(activity.application_id, activity.assets?.small_image)}
                <div class="carousel-item">
                    <div class="activity">
                        <div class="icon-wrapper">
                            {#if largeImage}
                                <img src={largeImage} alt={activity.name} class="large-icon" />
                            {:else}
                                <div class="fallback-icon">
                                    {activity.name.substring(0, 2)}
                                </div>
                            {/if}
                            {#if smallImage}
                                <img src={smallImage} alt="status" class="small-icon" />
                            {/if}
                        </div>
                        <div class="info">
                            <div class="name">{activity.name}</div>
                            {#if activity.details}
                                <div class="details">{activity.details}</div>
                            {/if}
                            {#if activity.state}
                                <div class="state">{activity.state}</div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="carousel-item">
                <div class="empty-state">
                    <p>Not doing anything right now...</p>
                </div>
            </div>
        {/if}
    </div>

    <button
        onclick={() => scrollCarousel(1)}
        class="nav-btn next"
        aria-label="Next Activity"
        disabled={!activities || activities.length === 0 || isLoading}
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
</div>

<style>
    :root {
        --activity-height: 115px;
    }

    .carousel-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 115px;
        width: 100%;
        gap: 0.5rem;
    }

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
        height: 100%;
        border-radius: 16px;
        outline: 2px solid var(--fg-accent);
    }

    .activity-carousel::-webkit-scrollbar {
        display: none;
    }

    .carousel-item {
        flex: 0 0 100%;
        width: 100%;
        min-width: 100%;
        height: 100%;
        scroll-snap-align: center;
        display: flex;
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

    .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
    }

    .nav-btn:hover:not(:disabled) {
        background-color: var(--fg-accent);
        color: var(--bg-primary);
        opacity: 1;
        transform: scale(1.1);
    }

    .nav-btn:active:not(:disabled) {
        transform: scale(0.95);
    }

    @media (max-width: 768px) {
        .nav-btn {
            display: none;
        }
    }

    .activity-skeleton {
        display: flex;
        background-color: var(--bg-primary-dark);
        height: var(--activity-height);
        width: 100%;
        align-items: center;
        padding: 0 12px;
        gap: 1rem;
        animation: pulse 1.5s infinite ease-in-out;
        box-sizing: border-box;
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
        gap: 0.5rem;
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
        height: var(--activity-height);
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-primary-dark);
        color: var(--fg-primary-dark);
        font-style: italic;
        box-sizing: border-box;

        & * {
            margin: 0;
        }
    }

    .activity {
        display: flex;
        background-color: var(--bg-primary-dark);
        height: var(--activity-height);
        width: 100%;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
    }

    .icon-wrapper {
        position: relative;
        padding: 12px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .large-icon {
        width: 80px;
        border-radius: 12px;
        object-fit: cover;
    }

    .fallback-icon {
        width: 100px;
        border-radius: 12px;
        background-color: var(--bg-primary-light);
        color: var(--fg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.5rem;
        text-transform: uppercase;
    }

    .small-icon {
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 28px;
        border-radius: 50%;
        border: 2px solid var(--bg-primary-dark);
        background-color: var(--bg-primary-dark);
    }

    .info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 12px;
        overflow-x: hidden;
        width: 100%;
    }

    .name {
        font-weight: bold;
        color: var(--fg-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .details,
    .state {
        font-size: 0.875rem;
        color: var(--fg-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0.9;
    }
</style>
