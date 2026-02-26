<script lang="ts">
    import { ui } from "$lib/stores/ui.svelte";
    import { audioState } from "$lib/stores/audio.svelte";
    import { settings } from "$lib/stores/settings.svelte";
    import { page } from "$app/state";
    import { fade, fly } from "svelte/transition";

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
            <h2>SYSTEM_MENU</h2>
            <div class="header-actions">
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
                        ></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </a>
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

        <div class="scanner-section">
            <div class="display">
                <span class="label">FREQ:</span>
                <span class="value glitch" data-text={audioState.statusText}>{audioState.statusText}</span>
            </div>

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
    </aside>
{/if}

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
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
        overflow-y: scroll;
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
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
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

    h2 {
        font-family: inherit;
        font-size: 1.2rem;
        color: var(--fg-primary);
        margin: 0;
        letter-spacing: -1px;
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
        font-family: inherit;
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
        margin-top: auto;
        padding: 1rem;
        border: 1px solid var(--border-primary);
        background: rgba(0, 0, 0, 0.3);
        border-radius: var(--radius);
    }

    .display {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-family: inherit;
        font-size: 0.8rem;
    }

    .value {
        color: var(--fg-primary-light);
        font-weight: bold;
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

    .volume-control {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .volume-control .label {
        font-family: inherit;
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
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
        border-radius: calc(var(--radius) / 2);
    }

    button:hover {
        background: var(--fg-primary);
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
