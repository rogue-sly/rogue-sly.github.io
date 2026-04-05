<script lang="ts">
    import { slide } from "svelte/transition";
    import { settings } from "$lib/stores/settings.svelte";
    import { STATIONS, StreamStore, MetadataStore } from "$lib/stores/nightride";
    import Icon from "@iconify/svelte";

    let { stream, metadata }: { stream: StreamStore; metadata: MetadataStore } = $props();

    let isExpanded = $state(false);

    function handleVolumeChange(e: Event) {
        const target = e.target as HTMLInputElement;
        settings.stream.volume = parseFloat(target.value);
    }

    function toggleExpand() {
        isExpanded = !isExpanded;
    }
</script>

<!-- Floating Ribbon -->
<div class="radio-scanner">
    <!-- Collapsed Ribbon -->
    <button
        class="ribbon"
        onclick={toggleExpand}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse Radio Scanner" : "Expand Radio Scanner"}
    >
        <span class="ribbon-label">
            <span class="icon"><Icon icon="lucide:radio" width="18" height="18" /></span>
        </span>
        <div class="ribbon-status">
            <span class:status-indicator:active={stream.isPlaying}></span>
        </div>
        <span class="ribbon-toggle">
            {#if isExpanded}
                <span class="icon"><Icon icon="lucide:chevron-up" width="16" height="16" /></span>
            {:else}
                <span class="icon"><Icon icon="lucide:chevron-down" width="16" height="16" /></span>
            {/if}
        </span>
    </button>

    <!-- Expanded Panel -->
    {#if isExpanded}
        <div class="scanner-panel" transition:slide={{ duration: 300 }}>
            <div class="scanner-inner">
                <div class="display">
                    <span class="label"><Icon icon="lucide:waves" width="14" height="14" /></span>
                    <span class="value" data-text={stream.statusText}>{stream.statusText}</span>
                </div>

                {#if metadata.tracks[stream.currentStation.id]}
                    {@const currentTrack = metadata.tracks[stream.currentStation.id]}
                    {@const trackLength = currentTrack.title.length}
                    {@const artistLength = currentTrack.artist.length}
                    <div class="display" transition:slide>
                        <span class="label"><Icon icon="lucide:music" width="14" height="14" /></span>
                        <span class="value" class:marquee={trackLength > 20}>
                            {currentTrack.title}
                        </span>
                    </div>
                    <div class="display" transition:slide>
                        <span class="label"><Icon icon="lucide:user" width="14" height="14" /></span>
                        <span class="value" class:marquee={artistLength > 20}>
                            {currentTrack.artist}
                        </span>
                    </div>
                {/if}

                <div class="visualizer">
                    {#each Array(8)}
                        <div
                            class="bar"
                            style:height={stream.isPlaying && !stream.isMuted ? Math.random() * 100 + "%" : "2px"}
                            style:opacity={stream.isPlaying && !stream.isMuted ? 1 : 0.3}
                        ></div>
                    {/each}
                </div>

                <div class="station-grid">
                    {#each STATIONS as station}
                        <button
                            onclick={() => stream.setStation(station)}
                            class="btn-station"
                            class:active={stream.currentStation.id === station.id}
                            aria-label="Select {station.name} station"
                        >
                            {station.name}
                        </button>
                    {/each}
                </div>

                <div class="volume-control">
                    <span class="label"><Icon icon="lucide:volume-2" width="14" height="14" /></span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settings.stream.volume}
                        oninput={handleVolumeChange}
                        class="range-input"
                        aria-label="Volume"
                    />
                </div>

                <div class="controls">
                    <button
                        onclick={() => stream.togglePlay()}
                        class="btn-scan"
                        aria-label={stream.isPlaying ? "Stop Scan" : "Start Scan"}
                    >
                        {#if stream.isPlaying}
                            <span class="icon"><Icon icon="lucide:stop-circle" width="20" height="20" /></span>
                        {:else}
                            <span class="icon"><Icon icon="lucide:play-circle" width="20" height="20" /></span>
                        {/if}
                    </button>

                    <button
                        onclick={() => stream.toggleMute()}
                        class="btn-mute"
                        aria-label={stream.isMuted ? "Unmute" : "Mute"}
                    >
                        {#if stream.isMuted}
                            <span class="icon"><Icon icon="lucide:volume-x" width="20" height="20" /></span>
                        {:else}
                            <span class="icon"><Icon icon="lucide:volume-2" width="20" height="20" /></span>
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .radio-scanner {
        position: fixed;
        bottom: 15px;
        right: 60px;
        z-index: 2;
        display: flex;
        flex-direction: column-reverse;
        align-items: flex-end;
        gap: 8px;
    }

    .ribbon {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.55rem 0.7rem;
        background: var(--bg-transparent-dark);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        color: var(--fg-primary);
        cursor: pointer;
        transition: all 0.2s;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        font-size: 0.7rem;
    }

    .ribbon:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--fg-primary-light);
        border-color: var(--fg-primary-dark);
    }

    .ribbon-label {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ribbon-label .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
    }

    .ribbon-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
            box-shadow: 0 0 4px var(--fg-accent);
        }
        50% {
            opacity: 0.5;
            box-shadow: 0 0 8px var(--fg-accent);
        }
    }

    .ribbon-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fg-primary-dark);
        min-width: 30px;
        text-align: center;
    }

    .ribbon-toggle .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
    }

    .scanner-panel {
        width: 320px;
        max-height: calc(100vh - 120px);
        overflow-y: auto;
        background: var(--bg-primary-dark);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
    }

    .scanner-inner {
        padding: 1rem;
        position: relative;
        z-index: 1;

        & .label {
            background-color: var(--bg-primary-dark);
            z-index: 2;
        }
    }

    .display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 0.8rem;
        overflow: hidden;
    }

    .value {
        color: var(--fg-primary-light);
        font-weight: bold;
        overflow: hidden;
        white-space: nowrap;
    }

    .value.marquee {
        display: inline-block;
        animation: marquee 8s linear infinite;
        padding-right: 2rem;
    }

    @keyframes marquee {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(-100%);
        }
    }

    .visualizer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 40px;
        margin-bottom: 12px;
        border-bottom: 1px solid var(--border-primary);
        padding-bottom: 2px;
    }

    .bar {
        width: 8%;
        background-color: var(--fg-primary);
        transition: height 0.1s ease;
        min-height: 2px;
        border-radius: calc(var(--radius) / 4);
    }

    .station-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .btn-station {
        padding: 0.25rem 0.5rem;
        font-size: 0.7rem;
        text-align: left;
        border: 1px solid var(--border-primary);
        opacity: 0.7;
    }

    .btn-station:hover {
        opacity: 1;
        background-color: var(--fg-primary-dark);
    }

    .btn-station.active {
        background: var(--fg-primary);
        color: var(--bg-primary);
        opacity: 1;
        border-color: var(--fg-primary);
    }

    .btn-station.active::before {
        content: "> ";
    }

    .volume-control {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .volume-control .label {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
    }

    .display .label {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .range-input {
        flex: 1;
        height: 2px;
        background: var(--border-primary);
        appearance: none;
        outline: none;
    }

    .range-input::-webkit-slider-thumb {
        appearance: none;
        width: 10px;
        height: 16px;
        background: var(--fg-primary);
        cursor: pointer;
        border-radius: 1px;
        border: none;
        transition: background 0.2s;
    }

    .range-input::-webkit-slider-thumb:hover {
        background: var(--fg-primary-light);
    }

    button {
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--fg-primary);
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
        border-radius: calc(var(--radius) / 2);
    }

    button:hover {
        background: var(--fg-primary-dark);
        color: var(--bg-primary);
    }

    .controls {
        display: flex;
        gap: 0.5rem;
    }

    .controls button {
        flex: 1;
        padding: 0.5rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .controls .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
    }

    @media (max-width: 768px) {
        .radio-scanner {
            right: 20px;
            left: 20px;
        }

        .scanner-panel {
            width: 100%;
        }
    }
</style>
