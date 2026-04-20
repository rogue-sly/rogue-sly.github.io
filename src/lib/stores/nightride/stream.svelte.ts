import { AudioContextManager } from "./audio-context-manager";
import { SettingsStore } from "$lib/stores/settings.svelte";
import { STATIONS } from "$lib/data/stations";
import type { Station } from "$lib/types";

export { STATIONS };

export class StreamStore {
    private element: HTMLAudioElement | undefined;
    private settings: SettingsStore;
    private audioContextManager: AudioContextManager;
    private playPromise: Promise<void> | undefined;

    isPlaying = $state(false);
    isMuted = $state(false);
    statusText = $state("SYSTEM_OFFLINE");
    currentStation: Station = $state(STATIONS[0]);

    get analyser() {
        return this.audioContextManager.analyser;
    }

    constructor(settings: SettingsStore) {
        this.settings = settings;
        this.audioContextManager = new AudioContextManager();
        this.currentStation = STATIONS.find((s) => s.id === settings.stream.lastStationId) ?? STATIONS[0];
    }

    connect() {
        this.element = new Audio();
        this.element.crossOrigin = "anonymous";
        this.element.src = this.currentStation.mp3;
        this.element.volume = this.settings.stream.volume;

        this.element.addEventListener("play", () => {
            this.isPlaying = true;
            this.statusText = "RECEIVING...";
        });

        this.element.addEventListener("playing", () => {
            this.statusText = "RECEIVING...";
            this.audioContextManager.connect(this.element!);
            this.audioContextManager.resume();
        });

        this.element.addEventListener("pause", () => {
            this.isPlaying = false;
            this.statusText = "SIGNAL_LOST";
        });

        this.element.addEventListener("waiting", () => {
            this.statusText = "BUFFERING...";
        });

        this.element.addEventListener("loadedmetadata", () => {
            this.statusText = "SYSTEM_ONLINE";
        });

        $effect(() => {
            if (this.element) {
                this.element.volume = this.settings.stream.volume;
            }
        });
    }

    async setStation(station: Station) {
        if (this.currentStation.id === station.id) return;
        if (!this.element) return;

        const wasPlaying = this.isPlaying;

        if (wasPlaying) {
            this.element.pause();
            this.isPlaying = false;
        }

        this.currentStation = station;
        this.settings.stream.lastStationId = station.id;
        this.statusText = "SWITCHING...";
        this.element.src = station.mp3;

        if (wasPlaying) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            await this.togglePlay();
        }
    }

    async togglePlay() {
        if (!this.element || this.playPromise) return;

        if (this.isPlaying) {
            this.element.pause();
        } else {
            this.playPromise = this.element.play();

            try {
                await this.playPromise;
            } catch (cause) {
                if (cause instanceof DOMException && cause.name !== "AbortError") {
                    console.error("Audio playback failed:", cause);
                    this.statusText = "ERR: INTERFERENCE";
                }
            }

            this.playPromise = undefined;
        }
    }

    toggleMute() {
        if (!this.element) return;
        this.isMuted = !this.isMuted;
        this.element.muted = this.isMuted;
    }

    disconnect() {
        if (this.element) {
            this.element.pause();
            this.element.src = "";
        }
        this.isPlaying = false;
        this.statusText = "SYSTEM_OFFLINE";
        this.audioContextManager.disconnect();
    }
}
