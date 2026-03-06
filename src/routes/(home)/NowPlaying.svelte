<script lang="ts">
    import { metadata } from "$lib/stores/nightride";
    import { stream } from "$lib/stores/nightride";

    type State = "loading" | "empty" | "playing";

    let state: State = $derived.by(() => {
        if (stream.isPlaying) {
            return "playing";
        }

        if (metadata.tracks[stream.currentStation.id] === undefined) {
            return "loading";
        }

        return "empty";
    });

    let track = $derived(metadata.tracks[stream.currentStation.id]);
</script>

<div class="wrapper">
    {#if state !== "loading"}
        <span class="station">{stream.currentStation.name}</span>
    {/if}
    <div class="now-playing" class:is-loading={state === "loading"} class:is-empty={state === "empty"}>
        {#if state === "loading"}
            <span class="dot pulse"></span>
            <span class="text muted">Connecting to station...</span>
        {:else if state === "empty"}
            <span class="dot off"></span>
            <span class="text muted">Radio offline</span>
        {:else if state === "playing" && track}
            <span class="dot live"></span>
            <div class="track-info">
                <span class="title">{track.title}</span>
                <span class="sep">—</span>
                <span class="artist">{track.artist}</span>
            </div>
        {/if}
    </div>
</div>

<style>
    .wrapper {
        display: inline-flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .now-playing {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.75rem;
        background-color: var(--bg-transparent-light);
        border: 1px solid var(--fg-accent);
        border-radius: var(--radius);
        padding: 0.35rem 0.75rem;
        max-width: min(380px, 90vw);
        overflow: hidden;
        transition: border-color 0.3s ease;
    }

    .now-playing.is-loading,
    .now-playing.is-empty {
        border-color: color-mix(in srgb, var(--fg-accent) 40%, transparent);
    }

    .station {
        font-weight: 700;
        font-size: 0.65rem;
        letter-spacing: 0.08em;
        color: var(--fg-accent);
        text-transform: uppercase;
        white-space: nowrap;
        padding-left: 0.1rem;
    }

    /* Status dot */
    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .dot.live {
        background-color: var(--fg-accent);
        box-shadow: 0 0 6px var(--fg-accent);
        animation: blink 2s ease-in-out infinite;
    }

    .dot.pulse {
        background-color: var(--fg-secondary);
        animation: pulse 1.5s ease-in-out infinite;
    }

    .dot.off {
        background-color: color-mix(in srgb, var(--fg-secondary) 40%, transparent);
    }

    /* Text */
    .text {
        white-space: nowrap;
    }

    .text.muted {
        color: var(--fg-secondary);
        opacity: 0.6;
        font-style: italic;
    }

    /* Track info */
    .track-info {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        overflow: hidden;
        white-space: nowrap;
        min-width: 0;
    }

    .title {
        font-weight: 600;
        color: var(--fg-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
    }

    .sep {
        color: var(--fg-secondary);
        opacity: 0.5;
        flex-shrink: 0;
    }

    .artist {
        color: var(--fg-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        flex-shrink: 0;
    }

    @keyframes blink {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 0.4;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.3);
        }
    }
</style>
