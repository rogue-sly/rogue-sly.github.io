<script lang="ts">
    import * as ui from "$lib/stores/ui";
    import { slide } from "svelte/transition";
    import { settings } from "$lib/stores/settings.svelte";
    import { stream, metadata, STATIONS } from "$lib/stores/nightride";

    function handleVolumeChange(e: Event) {
        const target = e.target as HTMLInputElement;
        settings.stream.volume = parseFloat(target.value);
    }
</script>

<div class="scanner-section" class:collapsed={ui.misc.isScannerCollapsed}>
    <button
        class="scanner-header"
        onclick={() => ui.misc.toggleScanner()}
        aria-expanded={!ui.misc.isScannerCollapsed}
        aria-controls="scanner-content"
    >
        <span class="label">RADIO_UNIT</span>
        <div class="header-status">
            {#if stream.isPlaying}
                <span class="status-active">RECEIVING</span>
            {/if}
            <span class="toggle-icon">{ui.misc.isScannerCollapsed ? "[+]" : "[-]"}</span>
        </div>
    </button>

    {#if !ui.misc.isScannerCollapsed}
        <div id="scanner-content" transition:slide={{ duration: 300 }}>
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
                            style:height={stream.isPlaying && !stream.isMuted
                                ? Math.random() * 100 + "%"
                                : "2px"}
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

                <div class="stream-format-toggle">
                    <span class="label">STREAM:</span>
                    <div class="toggle-buttons">
                        <button
                            class:active={settings.stream.format === "mp3"}
                            onclick={() => (settings.stream.format = "mp3")}
                        >
                            MP3
                        </button>
                        <button
                            class:active={settings.stream.format === "hls"}
                            onclick={() => (settings.stream.format = "hls")}
                        >
                            HLS
                        </button>
                    </div>
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
    .scanner-section {
        flex-shrink: 0;
        padding: 0;
        border: 1px solid var(--border-primary);
        background: var(--bg-transparent-dark);
        border-radius: var(--radius);
        overflow: hidden;
    }

    .scanner-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: none;
        border-bottom: 1px solid transparent;
        border-radius: 0;
        cursor: pointer;
    }

    .scanner-header:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--fg-primary-light);
    }

    .scanner-section:not(.collapsed) .scanner-header {
        border-bottom-color: var(--border-primary);
    }

    #scanner-content {
        padding: 0;
    }

    .scanner-inner {
        padding: 1rem;

        & .label {
            background-color: var(--bg-primary-dark);
            z-index: 2;
        }
    }

    .header-status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.7rem;
    }

    .status-active {
        color: var(--fg-accent);
        font-weight: bold;
        animation: pulse 2s infinite;
    }

    .toggle-icon {
        color: var(--fg-primary-dark);
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
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

    .stream-format-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.7rem;
    }

    .stream-format-toggle .label {
        color: var(--fg-primary-dark);
    }

    .toggle-buttons {
        display: flex;
        gap: 0.25rem;
    }

    .toggle-buttons button {
        padding: 0.15rem 0.5rem;
        font-size: 0.65rem;
        opacity: 0.6;
    }

    .toggle-buttons button.active {
        opacity: 1;
        background: var(--fg-primary);
        color: var(--bg-primary);
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
</style>
