<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "#lib/components/Icon.svelte";
    import { radio, type RadioTrack } from "#lib/data/radio.js";

    const VOLUME_KEY = "radio:volume";
    const ENABLED_KEY = "radio:enabled";

    let audio: HTMLAudioElement;

    let volume = $state(0.3);
    let muted = $state(false);

    let playing = $state(false);
    let buffering = $state(false);
    let error = $state<string | null>(null);

    let track = $state<RadioTrack | null>(null);
    let collapsed = $state(true);

    /* 
        progress is interpolated locally between metadata polls so the bar
        moves smoothly. A live stream can't actually be seeked.
    */
    let basePosition = $state(0);
    let baseLength = $state(0);
    let baseTime = 0;
    let now = $state(0);

    const progress = $derived.by(() => {
        if (!baseLength) return 0;
        const pos = basePosition + (now - baseTime) / 1000;
        return Math.min(Math.max(pos, 0), baseLength);
    });

    const progressPct = $derived(baseLength ? (progress / baseLength) * 100 : 0);

    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let tickTimer: ReturnType<typeof setInterval> | undefined;
    let resumeHandler: ((event: Event) => void) | undefined;

    function formatTime(total: number) {
        const s = Math.max(0, Math.floor(total));
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    }

    function start() {
        if (!audio) return;
        error = null;
        buffering = true;
        audio.src = `${radio.stream}?_=${Date.now()}`;
        audio.volume = muted ? 0 : volume;
        audio.play().catch((e) => {
            if (e?.name === "AbortError") return; // expected when we stop/reconnect
            buffering = false;
            error = "Couldn't connect. Try again in a moment.";
        });
    }

    function stop() {
        if (!audio) return;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        playing = false;
        buffering = false;
    }

    function toggle() {
        if (playing || buffering) stop();
        else start();
    }

    function toggleMute() {
        muted = !muted;
        if (audio) audio.volume = muted ? 0 : volume;
    }

    function onVolumeInput(event: Event) {
        const value = Number((event.currentTarget as HTMLInputElement).value);
        volume = value;
        muted = value === 0;
        if (audio) audio.volume = muted ? 0 : value;
    }

    function handlePlaying() {
        playing = true;
        buffering = false;
        error = null;
        try {
            localStorage.setItem(ENABLED_KEY, "1");
        } catch (e) {
            console.error(`error: ${e}`); // storage unavailable
        }
    }

    async function refresh() {
        if (typeof document !== "undefined" && document.hidden) return;
        try {
            const res = await fetch(radio.status, { cache: "no-store" });
            if (!res.ok) return;
            const data = await res.json();
            const song = data?.song;
            if (song) {
                track = {
                    title: song.title ?? "Unknown track",
                    artist: song.artist ?? "",
                    album: song.album ?? "",
                    artwork: song.artwork_sm_src || song.artwork_src || "",
                    length: song.length ?? 0,
                };
                basePosition = song.position ?? 0;
                baseLength = song.length ?? 0;
            } else {
                track = null;
                basePosition = 0;
                baseLength = 0;
            }
            baseTime = Date.now();
            now = baseTime;
        } catch (e) {
            console.error(`error: ${e}`); // keep the last known track on failure
        }
    }

    function updateMediaSession() {
        if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
        if (!track) return;
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album || radio.name,
                artwork: track.artwork ? [{ src: track.artwork, sizes: "512x512", type: "image/jpeg" }] : [],
            });
            navigator.mediaSession.playbackState = playing ? "playing" : "paused";
        } catch (e) {
            console.error(`error: ${e}`); // MediaMetadata unsupported
        }
    }

    // persist volume
    $effect(() => {
        const value = volume;
        try {
            localStorage.setItem(VOLUME_KEY, String(value));
        } catch (e) {
            console.error(`error: ${e}`); // storage unavailable
        }
    });

    // push track info to the OS media controls
    $effect(() => {
        const current = track;
        const isPlaying = playing;
        void current;
        void isPlaying;
        updateMediaSession();
    });

    onMount(() => {
        try {
            const stored = localStorage.getItem(VOLUME_KEY);
            if (stored !== null && !Number.isNaN(Number(stored))) {
                volume = Math.min(Math.max(Number(stored), 0), 1);
            }
        } catch (e) {
            console.error(`error: ${e}`); // storage unavailable
        }

        now = Date.now();
        refresh();
        pollTimer = setInterval(refresh, radio.pollInterval);
        tickTimer = setInterval(() => (now = Date.now()), 1000);

        // if the user enabled music before, resume on their next interaction
        let enabled = false;
        try {
            enabled = localStorage.getItem(ENABLED_KEY) === "1";
        } catch (e) {
            console.error(`error: ${e}`); // storage unavailable
        }
        if (enabled) {
            resumeHandler = (event: Event) => {
                window.removeEventListener("pointerdown", resumeHandler!);
                window.removeEventListener("keydown", resumeHandler!);

                /*
                    if the first gesture is on the player's own controls, let them
                    handle it so we don't start then immediately stop.
                */
                if (event.target instanceof Element && event.target.closest(".radio")) return;

                start();
            };
            window.addEventListener("pointerdown", resumeHandler);
            window.addEventListener("keydown", resumeHandler);
        }

        return () => {
            if (pollTimer) clearInterval(pollTimer);
            if (tickTimer) clearInterval(tickTimer);
            if (resumeHandler) {
                window.removeEventListener("pointerdown", resumeHandler);
                window.removeEventListener("keydown", resumeHandler);
            }
        };
    });
</script>

<div class="radio" class:collapsed>
    <audio
        bind:this={audio}
        preload="none"
        onplaying={handlePlaying}
        onwaiting={() => (buffering = true)}
        onpause={() => (playing = false)}
        onerror={() => {
            if (audio?.getAttribute("src")) {
                error = "Stream disconnected.";
                playing = false;
                buffering = false;
            }
        }}
    ></audio>

    {#if collapsed}
        <button
            class="mini"
            class:active={playing}
            onclick={() => (collapsed = false)}
            aria-label="Expand radio player"
        >
            <span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </button>
    {:else}
        <header>
            <span class="station">{radio.name}</span>
            <button class="icon-btn" onclick={() => (collapsed = true)} aria-label="Minimize radio player">
                <Icon name="minimize" size="18px" />
            </button>
        </header>

        <div class="body">
            <div class="art" class:playing>
                {#if track?.artwork}
                    <img src={track.artwork} alt="" loading="lazy" />
                {:else}
                    <span class="art-fallback" aria-hidden="true">▚</span>
                {/if}
            </div>

            <div class="meta">
                <p class="title" title={track?.title ?? ""}>
                    {track?.title ?? error ?? "Nothing playing"}
                </p>
                <p class="artist" title={track?.artist ?? ""}>
                    {track?.artist ?? (error ? "—" : "…")}
                </p>
            </div>
        </div>

        {#if baseLength > 0}
            <div class="progress" role="presentation">
                <span class="elapsed">{formatTime(progress)}</span>
                <div class="bar"><div class="fill" style:width={`${progressPct}%`}></div></div>
                <span class="total">{formatTime(baseLength)}</span>
            </div>
        {/if}

        <div class="controls">
            <button class="play" onclick={toggle} aria-label={playing ? "Pause radio" : "Play radio"}>
                <Icon name={playing || buffering ? "pause" : "play"} size="18px" />
            </button>

            <button class="icon-btn" onclick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                <Icon name={muted || volume === 0 ? "volume-mute" : "volume"} size="18px" />
            </button>

            <input
                class="volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                oninput={onVolumeInput}
                aria-label="Volume"
            />
        </div>
    {/if}
</div>

<style>
    .radio {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 2;
        width: min(320px, calc(100vw - 2rem));
        padding: 0.75rem;
        background: var(--bg-primary-dark);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        font-size: 0.8rem;
        color: var(--fg-primary);
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }

    .radio.collapsed {
        width: auto;
        padding: 0;
        background: transparent;
        border: none;
        box-shadow: none;
    }

    header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .station {
        flex: 1;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.68rem;
        color: var(--fg-primary-dark);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .body {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        min-width: 0;
    }

    .art {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: var(--radius);
        border: 1px solid var(--border-primary);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
    }

    .art.playing {
        border-color: var(--fg-accent);
    }

    .art img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .art-fallback {
        color: var(--fg-primary-dark);
        font-size: 1.4rem;
    }

    .meta {
        min-width: 0;
        flex: 1;
    }

    .title,
    .artist {
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .title {
        color: var(--fg-primary-light);
        font-weight: 700;
    }

    .artist {
        color: var(--fg-primary-dark);
        font-size: 0.72rem;
    }

    .progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.62rem;
        color: var(--fg-primary-dark);
        font-variant-numeric: tabular-nums;
    }

    .bar {
        flex: 1;
        height: 3px;
        background: var(--bg-primary-light);
        border-radius: 2px;
        overflow: hidden;
    }

    .fill {
        height: 100%;
        background: var(--fg-accent);
        transition: width 0.95s linear;
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    button {
        background: none;
        border: none;
        color: var(--fg-primary);
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .play {
        width: 34px;
        height: 34px;
        border: 1px solid var(--fg-accent);
        border-radius: var(--radius);
        color: var(--fg-primary-light);
        transition:
            background 0.2s,
            color 0.2s;
    }

    .play:hover {
        background: var(--fg-accent);
    }

    .icon-btn:hover {
        color: var(--fg-primary-light);
    }

    .volume {
        flex: 1;
        min-width: 40px;
        accent-color: var(--fg-accent);
        cursor: pointer;
    }

    .mini {
        width: 44px;
        height: 44px;
        border-radius: var(--radius);
        background: var(--bg-primary-dark);
        border: 1px solid var(--border-primary);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    }

    .mini:hover {
        border-color: var(--fg-accent);
    }

    .eq {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 14px;
    }

    .eq i {
        width: 3px;
        height: 5px;
        background: var(--fg-primary-dark);
        border-radius: 1px;
    }

    .mini.active .eq i {
        background: var(--fg-primary-light);
        animation: eq 0.9s ease-in-out infinite;
    }

    .mini.active .eq i:nth-child(2) {
        animation-delay: 0.15s;
    }

    .mini.active .eq i:nth-child(3) {
        animation-delay: 0.3s;
    }

    .mini.active .eq i:nth-child(4) {
        animation-delay: 0.45s;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.35;
        }
    }

    @keyframes eq {
        0%,
        100% {
            height: 4px;
        }
        50% {
            height: 14px;
        }
    }

    @media (max-width: 600px) {
        .radio {
            right: 0.5rem;
            bottom: 0.5rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .mini.active .eq i,
        .fill {
            animation: none;
            transition: none;
        }
    }
</style>
