<script lang="ts">
    import type { Activity } from "$lib/types";

    let { activity }: { activity: Activity } = $props();

    function getImageUrl(appId: string | undefined, assetId: string | undefined) {
        if (!assetId) return null;
        if (assetId.startsWith("mp:")) {
            return `https://media.discordapp.net/${assetId.replace("mp:", "")}`;
        }
        if (assetId.startsWith("spotify:")) {
            return `https://i.scdn.co/image/${assetId.replace("spotify:", "")}`;
        }
        if (!appId) return null;
        return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
    }

    let largeImage = $derived(getImageUrl(activity.application_id, activity.assets?.large_image));
    let smallImage = $derived(getImageUrl(activity.application_id, activity.assets?.small_image));
</script>

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

<style>
    .activity {
        display: flex;
        background-color: var(--bg-primary-dark);
        height: 100px;
        border-radius: 16px;
        width: 100%;
        position: relative;
        overflow: hidden;
    }

    .icon-wrapper {
        position: relative;
        width: 100px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .large-icon {
        width: 75px;
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
        gap: 4px;
    }

    .name {
        font-weight: bold;
        color: var(--fg-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .details, .state {
        font-size: 0.875rem;
        color: var(--fg-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0.9;
    }
</style>
