<script lang="ts">
    import { ui } from "$lib/stores/ui.svelte";
    import { audioState, STATIONS } from "$lib/stores/audio.svelte";
    import { settings } from "$lib/stores/settings.svelte";
    import { nightride } from "$lib/stores/nightride.svelte";
    import { page } from "$app/state";
    import { fade, fly, slide } from "svelte/transition";

    function close() {
        ui.isOpen = false;
    }

    function handleVolumeChange(e: Event) {
        const target = e.target as HTMLInputElement;
        settings.volume = parseFloat(target.value);
    }
</script>

{#if ui.isOpen}
    <!-- Backdrop -->
    <div
        class="backdrop"
        transition:fade={{ duration: 200 }}
        onclick={close}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === "Escape" && close()}
    ></div>

    <!-- Sidebar Panel -->
    <aside class="sidebar" transition:fly={{ x: 300, duration: 300 }}>
        <div class="header">
            <div class="header-actions">
                <div>
                    <button
                        onclick={() => ui.toggleZenMode()}
                        class="btn-settings"
                        class:active={ui.isZenMode}
                        aria-label={ui.isZenMode ? "Show Content" : "Hide Content"}
                    >
                        {#if ui.isZenMode}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M9.88 9.88L4.62 4.62" />
                                <path d="M7.714 15.151a11.96 11.96 0 0 1-5.714-3.151 12 12 0 0 1 18.274-4.051" />
                                <path d="M14.122 14.122A3 3 0 0 1 12 15a3 3 0 0 1-3-3 3 3 0 0 1 .878-2.122" />
                                <path d="M17.808 17.808a12.13 12.13 0 0 1-5.808 1.192 12.13 12.13 0 0 1-8-3.04" />
                                <path d="m2 2 20 20" />
                            </svg>
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                />
                            </svg>
                        {/if}
                    </button>
                    <a href="/settings" class="btn-settings" onclick={close} aria-label="Settings">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                            >
                            </path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </a>
                </div>

                <button onclick={close} aria-label="Close Menu" class="btn-close">[CLOSE]</button>
            </div>
        </div>

        <nav>
            <ul>
                <li><a href="/" class:active={page.url.pathname === "/"} onclick={close}>/home</a></li>
                <li>
                    <a href="/whoami" class:active={page.url.pathname === "/whoami/"} onclick={close}>/whoami</a>
                </li>
                <li>
                    <a href="/blog" class:active={page.url.pathname.startsWith("/blog")} onclick={close}>/blog</a>
                </li>
                <li>
                    <a href="/projects/" class:active={page.url.pathname === "/projects/"} onclick={close}>
                        /projects
                    </a>
                </li>
                <li>
                    <a href="/contact" class:active={page.url.pathname === "/contact/"} onclick={close}>
                        /contact
                    </a>
                </li>
            </ul>
        </nav>

        <div class="scanner-section" class:collapsed={ui.isScannerCollapsed}>
            <button
                class="scanner-header"
                onclick={() => ui.toggleScanner()}
                aria-expanded={!ui.isScannerCollapsed}
                aria-controls="scanner-content"
            >
                <span class="label">RADIO_UNIT</span>
                <div class="header-status">
                    {#if audioState.isPlaying}
                        <span class="status-active">RECEIVING</span>
                    {/if}
                    <span class="toggle-icon">{ui.isScannerCollapsed ? "[+]" : "[-]"}</span>
                </div>
            </button>

            {#if !ui.isScannerCollapsed}
                <div id="scanner-content" transition:slide={{ duration: 300 }}>
                    <div class="scanner-inner">
                        <div class="display">
                            <span class="label">FREQ:</span>
                            <span class="value" data-text={audioState.statusText}>{audioState.statusText}</span>
                        </div>

                        {#if nightride.currentTrack}
                            {@const trackLength = nightride.currentTrack.title.length}
                            {@const artistLength = nightride.currentTrack.artist.length}
                            <div class="display" transition:slide>
                                <span class="label">TRACK:</span>
                                <span class="value" class:marquee={trackLength > 20}>
                                    {nightride.currentTrack.title}
                                </span>
                            </div>
                            <div class="display" transition:slide>
                                <span class="label">ARTIST:</span>
                                <span class="value" class:marquee={artistLength > 20}>
                                    {nightride.currentTrack.artist}
                                </span>
                            </div>
                        {/if}

                        <div class="visualizer">
                            {#each Array(8)}
                                <div
                                    class="bar"
                                    style:height={audioState.isPlaying && !audioState.isMuted
                                        ? Math.random() * 100 + "%"
                                        : "2px"}
                                    style:opacity={audioState.isPlaying && !audioState.isMuted ? 1 : 0.3}
                                ></div>
                            {/each}
                        </div>

                        <div class="station-grid">
                            {#each STATIONS as station}
                                <button
                                    onclick={() => audioState.setStation(station)}
                                    class="btn-station"
                                    class:active={audioState.currentStation.id === station.id}
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
                                    class:active={settings.streamFormat === "mp3"}
                                    onclick={() => (settings.streamFormat = "mp3")}
                                >
                                    MP3
                                </button>
                                <button
                                    class:active={settings.streamFormat === "hls"}
                                    onclick={() => (settings.streamFormat = "hls")}
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
                                value={settings.volume}
                                oninput={handleVolumeChange}
                                class="range-input"
                                aria-label="Volume"
                            />
                        </div>

                        <div class="controls">
                            <button
                                onclick={() => audioState.togglePlay()}
                                class="btn-scan"
                                aria-label={audioState.isPlaying ? "Stop Scan" : "Start Scan"}
                            >
                                [{audioState.isPlaying ? "HALT" : "INIT_SCAN"}]
                            </button>

                            {#if audioState.isPlaying}
                                <button
                                    onclick={() => audioState.toggleMute()}
                                    class="btn-mute"
                                    aria-label={audioState.isMuted ? "Unmute" : "Mute"}
                                >
                                    [{audioState.isMuted ? "UNMUTE" : "MUTE"}]
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </aside>
{/if}

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        background: var(--bg-transparent-dark);
        backdrop-filter: blur(2px);
        z-index: 998;
    }

    .sidebar {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 450px;
        background: var(--bg-primary-dark);
        border-left: 1px solid var(--border-primary);
        padding: 1.5rem;
        z-index: 999;
        display: flex;
        flex-direction: column;
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
        overflow: hidden;
    }

    .sidebar::before {
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
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-primary);
        padding-bottom: 1rem;
        flex-shrink: 0;
    }

    .header-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 0.5rem;

        & div {
            display: flex;
            gap: 0.5rem;
        }
    }

    .btn-settings {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        color: var(--fg-primary);
        border: 1px solid var(--border-primary);
        border-radius: calc(var(--radius) / 2);
        transition: all 0.2s;
    }

    .btn-settings:hover {
        background: var(--fg-primary);
        color: var(--bg-primary);
    }

    .btn-settings.active {
        background: var(--bg-accent);
        border-color: var(--bg-accent);
        color: var(--fg-primary-light);
    }

    nav {
        flex: 1;
        overflow-y: auto;
        margin: 1.5rem 0;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: var(--border-primary) transparent;
    }

    nav::-webkit-scrollbar {
        width: 4px;
    }

    nav::-webkit-scrollbar-thumb {
        background: var(--border-primary);
        border-radius: 2px;
    }

    nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    nav a {
        display: block;
        color: var(--fg-primary-dark);
        text-decoration: none;
        font-size: 1.1rem;
        padding: 0.5rem;
        transition: all 0.2s;
        border: 1px solid transparent;
        text-transform: uppercase;
        border-radius: calc(var(--radius) / 2);
    }

    nav a:hover,
    nav a.active {
        color: var(--fg-primary-light);
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--border-primary);
        padding-left: 1rem;
    }

    nav a.active::before {
        content: "> ";
        color: var(--fg-accent);
    }

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
        /* Remove padding here to avoid slide glitches */
        padding: 0;
    }

    .scanner-inner {
        padding: 1rem;
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

    .btn-close {
        padding: 0.5rem 1rem;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .btn-close:hover {
        background: var(--bg-accent);
        color: var(--fg-primary-light);
        border-color: var(--bg-accent);
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

    @media (max-width: 600px) {
        .sidebar {
            width: 100%;
        }
    }
</style>
