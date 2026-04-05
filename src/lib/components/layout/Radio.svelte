<script lang="ts">
    import { slide } from "svelte/transition";
    import { settings } from "$lib/stores/settings.svelte";
    import { STATIONS, StreamStore, MetadataStore } from "$lib/stores/nightride";

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
        <span class="ribbon-label">RADIO</span>
        <div class="ribbon-status">
            {#if stream.isPlaying}
                <span class="status-indicator active"></span>
                <span class="status-text">RECEIVING</span>
            {:else}
                <span class="status-indicator"></span>
                <span class="status-text">STANDBY</span>
            {/if}
        </div>
        <span class="ribbon-toggle">{isExpanded ? "[−]" : "[+]"}</span>
    </button>

    <!-- Expanded Panel -->
    {#if isExpanded}
        <div class="scanner-panel" transition:slide={{ duration: 300 }}>
            <div class="scanner-inner">
                <div class="display">
                    <span class="label">FREQ:</span>
                    <span class="value" data-text={stream.statusText}>{stream.statusText}</span>
                </div>

                {#if metadata.tracks[stream.currentStation.id]}
                    {@const currentTrack = metadata.tracks[stream.currentStation.id]}
                    {@const trackLength = currentTrack.title.length}
                    {@const artistLength = currentTrack.artist.length}
                    <div class="display" transition:slide>
                        <span class="label">TRACK:</span>
                        <span class="value" class:marquee={trackLength > 20}>
                            {currentTrack.title}
                        </span>
                    </div>
                    <div class="display" transition:slide>
                        <span class="label">ARTIST:</span>
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
                    <span class="label">GAIN:</span>
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
                        [{stream.isPlaying ? "HALT" : "INIT_SCAN"}]
                    </button>

                    {#if stream.isPlaying}
                        <button
                            onclick={() => stream.toggleMute()}
                            class="btn-mute"
                            aria-label={stream.isMuted ? "Unmute" : "Mute"}
                        >
                            [{stream.isMuted ? "UNMUTE" : "MUTE"}]
                        </button>
                    {/if}
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
        z-index: 1000;
        display: flex;
        flex-direction: column-reverse;
        align-items: flex-end;
        gap: 8px;
    }

    .ribbon {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.6rem 0.4rem;
        background: var(--bg-transparent-dark);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        color: var(--fg-primary);
        cursor: pointer;
        transition: all 0.2s;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        font-family: inherit;
        font-size: 0.8rem;
    }

    .ribbon:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--fg-primary-light);
        border-color: var(--fg-primary-dark);
    }

    .ribbon-label {
        font-weight: bold;
        text-transform: uppercase;
        min-width: 80px;
    }

    .ribbon-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.7rem;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-primary-dark);
        transition: all 0.2s;
    }

    .status-indicator.active {
        background: var(--fg-accent);
        animation: pulse 2s infinite;
    }

    .status-text {
        font-weight: bold;
        text-transform: uppercase;
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
        font-weight: bold;
        color: var(--fg-primary-dark);
        min-width: 30px;
        text-align: center;
    }

    .scanner-panel {
        width: 400px;
        max-height: calc(100vh - 120px);
        overflow-y: auto;
        background: var(--bg-primary-dark);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
    }

    .scanner-panel::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        background-size:
            100% 2px,
            3px 100%;
        pointer-events: none;
        z-index: -1;
        border-radius: var(--radius);
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
        font-size: 0.7rem;
        color: var(--fg-primary-dark);
        min-width: 40px;
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
