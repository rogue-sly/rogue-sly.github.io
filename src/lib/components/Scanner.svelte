<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let { streamUrl = "https://stream.nightride.fm/nightride.m4a" } = $props();

    let audio: HTMLAudioElement;
    let isPlaying = $state(false);
    let volume = $state(0.5);
    let isMuted = $state(false);
    let signalStrength = $state(0);
    let statusText = $state("SYSTEM_OFFLINE");
    let driftInterval: ReturnType<typeof setInterval>;
    let visualizerInterval: ReturnType<typeof setInterval>;

    // "Drift" effect: Randomly adjust volume to simulate radio interference
    function drift() {
        if (!isPlaying || isMuted) return;

        // Randomly change volume by small amount
        const change = (Math.random() - 0.5) * 0.1;
        let newVol = volume + change;
        
        // Clamp volume between 0.3 and 0.8
        if (newVol > 0.8) newVol = 0.8;
        if (newVol < 0.3) newVol = 0.3;
        
        volume = newVol;
        if (audio) audio.volume = volume;
    }

    // Fake visualizer update
    function updateVisualizer() {
        if (!isPlaying || isMuted) {
             signalStrength = 0;
             return;
        }
        // distinct from volume drift, just visual noise
        signalStrength = Math.random(); 
    }

    function togglePlay() {
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            statusText = "SIGNAL_LOST";
            signalStrength = 0;
            if (driftInterval) clearInterval(driftInterval);
            if (visualizerInterval) clearInterval(visualizerInterval);
        } else {
            audio.volume = volume;
            audio.play().then(() => {
                isPlaying = true;
                statusText = "RECEIVING...";
                driftInterval = setInterval(drift, 2000);
                visualizerInterval = setInterval(updateVisualizer, 100);
                drift(); 
            }).catch(e => {
                console.error("Audio playback failed:", e);
                statusText = "ERR: INTERFERENCE";
            });
        }
    }

    function toggleMute() {
        if (!audio) return;
        isMuted = !isMuted;
        audio.muted = isMuted;
    }

    onMount(() => {
        return () => {
            if (driftInterval) clearInterval(driftInterval);
            if (visualizerInterval) clearInterval(visualizerInterval);
        };
    });
</script>

<div class="scanner-panel" transition:fade>
    <div class="display">
        <span class="label">FREQ:</span>
        <span class="value glitch" data-text={statusText}>{statusText}</span>
    </div>
    
    <div class="visualizer">
        {#each Array(8) as _, i}
            <div 
                class="bar" 
                style:height="{isPlaying && !isMuted ? Math.random() * 100 + '%' : '2px'}"
                style:opacity="{isPlaying && !isMuted ? 1 : 0.3}"
            ></div>
        {/each}
    </div>

    <div class="controls">
        <button onclick={togglePlay} class="btn-scan" aria-label={isPlaying ? "Stop Scan" : "Start Scan"}>
            [{isPlaying ? "HALT" : "INIT_SCAN"}]
        </button>
        
        {#if isPlaying}
            <button onclick={toggleMute} class="btn-mute" aria-label={isMuted ? "Unmute" : "Mute"}>
                [{isMuted ? "UNMUTE" : "MUTE"}]
            </button>
        {/if}
    </div>

    <audio 
        bind:this={audio} 
        src={streamUrl} 
        crossorigin="anonymous"
    ></audio>
</div>

<style>
    .scanner-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 200px;
        padding: 12px;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid var(--fg-accent);
        font-family: 'Courier New', monospace;
        color: var(--fg-accent);
        z-index: 1000;
        backdrop-filter: blur(4px);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
    }

    .display {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 0.8rem;
        letter-spacing: 1px;
    }

    .label {
        opacity: 0.7;
    }

    .value {
        font-weight: bold;
        color: var(--fg-primary);
    }

    .visualizer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 30px;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 2px;
    }

    .bar {
        width: 8%;
        background-color: var(--fg-primary);
        transition: height 0.15s ease;
        min-height: 2px;
    }

    .controls {
        display: flex;
        gap: 8px;
    }

    button {
        flex: 1;
        background: transparent;
        border: 1px solid var(--fg-accent);
        color: var(--fg-accent);
        font-family: inherit;
        font-size: 0.75rem;
        padding: 6px 4px;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
        font-weight: bold;
    }

    button:hover {
        background: var(--fg-accent);
        color: var(--bg-primary);
    }

    /* Glitch effect */
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
        background: var(--bg-primary);
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
        0% { clip: rect(11px, 9999px, 81px, 0); }
        20% { clip: rect(104px, 9999px, 12px, 0); }
        40% { clip: rect(33px, 9999px, 19px, 0); }
        60% { clip: rect(89px, 9999px, 12px, 0); }
        80% { clip: rect(56px, 9999px, 99px, 0); }
        100% { clip: rect(27px, 9999px, 15px, 0); }
    }

    @keyframes glitch-anim-2 {
        0% { clip: rect(65px, 9999px, 100px, 0); }
        20% { clip: rect(12px, 9999px, 34px, 0); }
        40% { clip: rect(87px, 9999px, 5px, 0); }
        60% { clip: rect(43px, 9999px, 62px, 0); }
        80% { clip: rect(9px, 9999px, 28px, 0); }
        100% { clip: rect(101px, 9999px, 73px, 0); }
    }

    @media (max-width: 768px) and (orientation: portrait) {
        .scanner-panel {
            display: none;
        }
    }
</style>
