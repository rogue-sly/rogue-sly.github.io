import { ResultAsync } from "neverthrow";
import { AudioContextManager } from "./audio-context-manager";
import { SettingsStore } from "$lib/stores/settings.svelte";
import type { Station } from "$lib/types";
import type { AppError } from "$lib/errors";

export const STATIONS: Station[] = [
    {
        id: "nightride",
        name: "Nightride",
        mp3: "https://stream.nightride.fm/nightride.mp3",
    },
    {
        id: "chillsynth",
        name: "Chillsynth",
        mp3: "https://stream.nightride.fm/chillsynth.mp3",
    },
    {
        id: "datawave",
        name: "Datawave",
        mp3: "https://stream.nightride.fm/datawave.mp3",
    },
    {
        id: "spacesynth",
        name: "Spacesynth",
        mp3: "https://stream.nightride.fm/spacesynth.mp3",
    },
    {
        id: "darksynth",
        name: "Darksynth",
        mp3: "https://stream.nightride.fm/darksynth.mp3",
    },
    {
        id: "horrorsynth",
        name: "Horrorsynth",
        mp3: "https://stream.nightride.fm/horrorsynth.mp3",
    },
    {
        id: "ebsm",
        name: "EBSM",
        mp3: "https://stream.nightride.fm/ebsm.mp3",
    },
] as const;

export class StreamStore {
    private _element: HTMLAudioElement | undefined = $state();
    private settings: SettingsStore;
    private audioCtxManager: AudioContextManager;
    private visualizerInterval: ReturnType<typeof setInterval> | undefined;
    private playPromise: Promise<void> | undefined;

    // --- Public reactive state ---
    isPlaying = $state(false);
    isMuted = $state(false);
    statusText = $state("SYSTEM_OFFLINE");
    signalStrength = $state(0);
    // Safe default; overridden in constructor after this.settings is assigned.
    currentStation: Station = $state(STATIONS[0]);

    get element() {
        return this._element;
    }

    set element(el: HTMLAudioElement | undefined) {
        this._element = el;
        if (el) this.attachElement(el);
    }

    /** Exposes the analyser node for the Visualizer component. */
    get analyser() {
        return this.audioCtxManager.analyser;
    }

    constructor(settings: SettingsStore) {
        this.settings = settings;
        this.audioCtxManager = new AudioContextManager();
        // Resolve last-used station now that this.settings is available.
        this.currentStation = STATIONS.find((s) => s.id === settings.stream.lastStationId) ?? STATIONS[0];
    }

    /**
     * Initialises reactive effects. Must be called inside a Svelte component
     * script (e.g. +layout.svelte) so the effects are tracked properly.
     */
    initEffects() {
        // Sync volume to settings reactively
        $effect(() => {
            if (this._element) {
                this._element.volume = this.settings.stream.volume;
            }
        });
    }

    private attachElement(el: HTMLAudioElement) {
        el.volume = this.settings.stream.volume;
        el.muted = this.isMuted;

        el.addEventListener("play", () => {
            this.isPlaying = true;
            this.statusText = "RECEIVING...";
            this.startSignalAnimation();
        });

        el.addEventListener("playing", () => {
            this.statusText = "RECEIVING...";
            this.audioCtxManager.init(el);
            this.audioCtxManager.resume();
        });

        el.addEventListener("pause", () => {
            this.isPlaying = false;
            this.statusText = "SIGNAL_LOST";
            this.signalStrength = 0;
            this.stopSignalAnimation();
        });

        el.addEventListener("waiting", () => {
            this.statusText = "BUFFERING...";
        });

        el.addEventListener("loadedmetadata", () => {
            this.statusText = "SYSTEM_ONLINE";
        });

        el.src = this.currentStation.mp3;
    }

    async setStation(station: Station) {
        if (this.currentStation.id === station.id) return;

        const wasPlaying = this.isPlaying;

        if (wasPlaying) {
            this._element?.pause();
            this.isPlaying = false;
        }

        this.currentStation = station;
        this.settings.stream.lastStationId = station.id;
        this.statusText = "SWITCHING...";

        if (this._element) {
            this._element.src = this.currentStation.mp3;
        }

        if (wasPlaying) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            await this.togglePlay();
        }
    }

    async togglePlay() {
        if (!this._element) return;
        if (this.playPromise) return;

        if (this.isPlaying) {
            this._element.pause();
        } else {
            this.playPromise = this._element.play();

            const result = await ResultAsync.fromPromise(
                this.playPromise,
                (cause): AppError => ({
                    type: "STREAM_ERROR",
                    message: cause instanceof DOMException ? cause.name : String(cause),
                }),
            );

            this.playPromise = undefined;

            if (result.isErr()) {
                if (result.error.type === "STREAM_ERROR" && result.error.message !== "AbortError") {
                    console.error("Audio playback failed:", result.error);
                    this.statusText = "ERR: INTERFERENCE";
                }
            }
        }
    }

    toggleMute() {
        if (!this._element) return;
        this.isMuted = !this.isMuted;
        this._element.muted = this.isMuted;
    }

    private startSignalAnimation() {
        this.stopSignalAnimation();
        this.visualizerInterval = setInterval(() => this.updateSignalStrength(), 100);
    }

    private stopSignalAnimation() {
        if (this.visualizerInterval) clearInterval(this.visualizerInterval);
    }

    private updateSignalStrength() {
        if (!this.isPlaying || this.isMuted) {
            this.signalStrength = 0;
            return;
        }
        this.signalStrength = Math.random();
    }
}
