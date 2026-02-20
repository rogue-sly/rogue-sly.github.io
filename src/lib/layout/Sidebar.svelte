<script lang="ts">
    import { ui } from "$lib/stores/ui.svelte";
    import { audioState } from "$lib/stores/audio.svelte";
    import { page } from "$app/state";
    import { fade, fly } from "svelte/transition";

    function close() {
        ui.isOpen = false;
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
            <h2 class="glitch" data-text="SYSTEM_MENU">SYSTEM_MENU</h2>
            <button onclick={close} aria-label="Close Menu" class="btn-close">[CLOSE]</button>
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
                    <a href="/contact" class:active={page.url.pathname === "/contact/"} onclick={close}>/contact</a
                    >
                </li>
            </ul>
        </nav>

        <div class="scanner-section">
            <div class="display">
                <span class="label">FREQ:</span>
                <span class="value glitch" data-text={audioState.statusText}>{audioState.statusText}</span>
            </div>

            <div class="visualizer">
                {#each Array(8) as _, i}
                    <div
                        class="bar"
                        style:height={audioState.isPlaying && !audioState.isMuted
                            ? Math.random() * 100 + "%"
                            : "2px"}
                        style:opacity={audioState.isPlaying && !audioState.isMuted ? 1 : 0.3}
                    ></div>
                {/each}
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
        padding: 2rem;
        z-index: 999;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
        font-family: "JetBrains Mono", "Quantico", monospace;
    }

    .sidebar::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.25) 50%
        ), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        background-size: 100% 2px, 3px 100%;
        pointer-events: none;
        z-index: -1;
        border-top-left-radius: 16px;
        border-bottom-left-radius: 16px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-primary);
        padding-bottom: 1rem;
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
        border-radius: 8px;
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
        border-radius: 12px;
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
        border-radius: 2px;
    }

    button {
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--fg-primary);
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
        border-radius: 4px;
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

    .glitch {
        position: relative;
    }

    .glitch::before,
    .glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary-dark);
    }

    .glitch::before {
        left: 2px;
        text-shadow: -1px 0 red;
        clip: rect(24px, 550px, 90px, 0);
        animation: glitch-anim-2 3s infinite linear alternate-reverse;
    }

    .glitch::after {
        left: -2px;
        text-shadow: -1px 0 blue;
        clip: rect(85px, 550px, 140px, 0);
        animation: glitch-anim 2.5s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim {
        0% {
            clip: rect(11px, 9999px, 81px, 0);
        }
        20% {
            clip: rect(104px, 9999px, 12px, 0);
        }
        40% {
            clip: rect(33px, 9999px, 19px, 0);
        }
        60% {
            clip: rect(89px, 9999px, 12px, 0);
        }
        80% {
            clip: rect(56px, 9999px, 99px, 0);
        }
        100% {
            clip: rect(27px, 9999px, 15px, 0);
        }
    }

    @keyframes glitch-anim-2 {
        0% {
            clip: rect(65px, 9999px, 100px, 0);
        }
        20% {
            clip: rect(12px, 9999px, 34px, 0);
        }
        40% {
            clip: rect(87px, 9999px, 5px, 0);
        }
        60% {
            clip: rect(43px, 9999px, 62px, 0);
        }
        80% {
            clip: rect(9px, 9999px, 28px, 0);
        }
        100% {
            clip: rect(101px, 9999px, 73px, 0);
        }
    }
</style>
