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
    private audioContextManager: AudioContextManager;
    private visualizerInterval: ReturnType<typeof setInterval> | undefined;
    private playPromise: Promise<void> | undefined;

    isPlaying = $state(false);
    isMuted = $state(false);
    statusText = $state("SYSTEM_OFFLINE");
    signalStrength = $state(0);
    currentStation: Station = $state(STATIONS[0]);

    get element() {
        return this._element;
    }

    set element(element: HTMLAudioElement | undefined) {
        this._element = element;
        if (element) this.attachElement(element);
    }

    /** Exposes the analyser node for the Visualizer component. */
    get analyser() {
        return this.audioContextManager.analyser;
    }

    constructor(settings: SettingsStore) {
        this.settings = settings;
        this.audioContextManager = new AudioContextManager();
        this.currentStation = STATIONS.find((s) => s.id === settings.stream.lastStationId) ?? STATIONS[0];

        // Sync volume to settings reactively
        $effect(() => {
            if (this._element) {
                this._element.volume = this.settings.stream.volume;
            }
        });
    }

    private attachElement(element: HTMLAudioElement) {
        element.volume = this.settings.stream.volume;
        element.muted = this.isMuted;

        element.addEventListener("play", () => {
            this.isPlaying = true;
            this.statusText = "RECEIVING...";
            this.startSignalAnimation();
        });

        element.addEventListener("playing", () => {
            this.statusText = "RECEIVING...";
            this.audioContextManager.connect(element);
            this.audioContextManager.resume();
        });

        element.addEventListener("pause", () => {
            this.isPlaying = false;
            this.statusText = "SIGNAL_LOST";
            this.signalStrength = 0;
            this.stopSignalAnimation();
        });

        element.addEventListener("waiting", () => {
            this.statusText = "BUFFERING...";
        });

        element.addEventListener("loadedmetadata", () => {
            this.statusText = "SYSTEM_ONLINE";
        });

        element.src = this.currentStation.mp3;
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

    disconnect() {
        if (this._element) {
            this._element.pause();
            this._element.src = "";
        }
        this.isPlaying = false;
        this.statusText = "SYSTEM_OFFLINE";
        this.signalStrength = 0;
        this.stopSignalAnimation();
        this.audioContextManager.disconnect();
    }
}
