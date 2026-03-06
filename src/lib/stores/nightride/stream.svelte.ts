import Hls from "hls.js";
import { ResultAsync } from "neverthrow";
import { SettingsStore } from "../settings.svelte";
import type { Station } from "$lib/types";
import type { AppError } from "$lib/errors";

export const STATIONS: Station[] = [
    {
        id: "nightride",
        name: "Nightride",
        mp3: "https://stream.nightride.fm/nightride.mp3",
        hls: "https://stream.nightride.fm:8443/nightride/nightride.m3u8",
    },
    {
        id: "chillsynth",
        name: "Chillsynth",
        mp3: "https://stream.nightride.fm/chillsynth.mp3",
        hls: "https://stream.nightride.fm:8443/chillsynth/chillsynth.m3u8",
    },
    {
        id: "datawave",
        name: "Datawave",
        mp3: "https://stream.nightride.fm/datawave.mp3",
        hls: "https://stream.nightride.fm:8443/datawave/datawave.m3u8",
    },
    {
        id: "spacesynth",
        name: "Spacesynth",
        mp3: "https://stream.nightride.fm/spacesynth.mp3",
        hls: "https://stream.nightride.fm:8443/spacesynth/spacesynth.m3u8",
    },
    {
        id: "darksynth",
        name: "Darksynth",
        mp3: "https://stream.nightride.fm/darksynth.mp3",
        hls: "https://stream.nightride.fm:8443/darksynth/darksynth.m3u8",
    },
    {
        id: "horrorsynth",
        name: "Horrorsynth",
        mp3: "https://stream.nightride.fm/horrorsynth.mp3",
        hls: "https://stream.nightride.fm:8443/horrorsynth/horrorsynth.m3u8",
    },
    {
        id: "ebsm",
        name: "EBSM",
        mp3: "https://stream.nightride.fm/ebsm.mp3",
        hls: "https://stream.nightride.fm:8443/ebsm/ebsm.m3u8",
    },
] as const;

// Global Audio state
export class StreamStore {
    private _element: HTMLAudioElement | undefined = $state();
    private settings: SettingsStore;

    get element() {
        return this._element;
    }

    set element(el: HTMLAudioElement | undefined) {
        this._element = el;
        if (el) {
            this.setElement(el);
        }
    }
    hls: Hls | undefined;
    isPlaying = $state(false);
    isMuted = $state(false);
    statusText = $state("SYSTEM_OFFLINE");
    signalStrength = $state(0);
    currentStation: Station = $state(
        STATIONS.find((s) => s.id === this.settings.stream.lastStationId) ?? STATIONS[0],
    );

    get currentUrl() {
        return this.settings.stream.format === "hls" ? this.currentStation.hls : this.currentStation.mp3;
    }

    get useHls() {
        return this.settings.stream.format === "hls";
    }

    private visualizerInterval: number | undefined;

    audioCtx: AudioContext | undefined;
    analyser: AnalyserNode | undefined;
    source: MediaElementAudioSourceNode | undefined;

    constructor(settings: SettingsStore) {
        this.settings = settings;
    }

    /**
     * Initializes reactive effects. Must be called within a Svelte effect scope
     * (e.g., in a component's script tag or onMount).
     */
    initEffects() {
        // Reactively update element volume when settings change
        $effect(() => {
            if (this._element) {
                this._element.volume = this.settings.stream.volume;
            }
        });

        // Reactively reload stream when format changes
        $effect(() => {
            const _format = this.settings.stream.format;
            if (this._element) {
                const wasPlaying = this.isPlaying;
                if (wasPlaying) {
                    this._element.pause();
                }
                this.initHls();
                if (wasPlaying) {
                    this.hls?.startLoad();
                    this._element.play().catch(() => {});
                }
            }
        });
    }

    setElement(el: HTMLAudioElement) {
        this._element = el;
        if (this._element) {
            this._element.volume = this.settings.stream.volume;
            this._element.muted = this.isMuted;

            this._element.addEventListener("play", () => {
                this.isPlaying = true;
                this.statusText = "RECEIVING...";
                this.startEffects();
                if (this.hls) this.hls.startLoad();
            });

            this._element.addEventListener("playing", () => {
                this.statusText = "RECEIVING...";
                this.initAudioContext();
                if (this.audioCtx?.state === "suspended") {
                    this.audioCtx.resume();
                }
            });

            this._element.addEventListener("pause", () => {
                this.isPlaying = false;
                this.statusText = "SIGNAL_LOST";
                this.signalStrength = 0;
                this.stopEffects();
                if (this.hls) this.hls.stopLoad();
            });

            this._element.addEventListener("waiting", () => {
                this.statusText = "BUFFERING...";
            });

            this.initHls();
        }
    }

    private initAudioContext() {
        if (typeof window === "undefined" || typeof document === "undefined") return;

        if (document.readyState !== "complete" && document.readyState !== "interactive") {
            return;
        }

        if (!this.source && this._element) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioContext();

            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;

            this.source = this.audioCtx.createMediaElementSource(this._element);

            // source -> analyzer -> destination
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
        }
    }

    private playPromise: Promise<void> | undefined;

    private initHls() {
        if (!this.element) return;

        if (!this.useHls) {
            if (this.hls) {
                this.hls.destroy();
                this.hls = undefined;
            }
            this.element.src = this.currentStation.mp3;
            this.element.addEventListener("loadedmetadata", () => {
                this.statusText = "SYSTEM_ONLINE";
            });
            return;
        }

        // Cleanup any existing instance
        if (this.hls) {
            this.hls.destroy();
            this.hls = undefined;
        }

        if (Hls.isSupported()) {
            this.hls = new Hls({
                autoStartLoad: false,
                enableWorker: false,
                manifestLoadingMaxRetry: 5,
                manifestLoadingRetryDelay: 1000,
                fragLoadingMaxRetry: 5,
                fragLoadingRetryDelay: 1000,
                xhrSetup: (xhr) => {
                    xhr.withCredentials = false;
                },
            });
            this.hls.loadSource(this.currentUrl);
            this.hls.attachMedia(this.element);

            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.statusText = "SYSTEM_ONLINE";
                if (this.isPlaying && this.hls?.liveSyncPosition) {
                    this.element!.currentTime = this.hls.liveSyncPosition;
                }
            });

            this.hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.statusText = "ERR: NETWORK";
                            if (
                                data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                                data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
                            ) {
                                this.hls?.loadSource(this.currentUrl);
                            } else {
                                this.hls?.startLoad();
                            }
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.statusText = "ERR: MEDIA";
                            this.hls?.recoverMediaError();
                            if (this.isPlaying) {
                                this.hls?.startLoad();
                            }
                            break;
                        default:
                            this.statusText = "ERR: FATAL";
                            this.hls?.destroy();
                            break;
                    }
                }
            });
        } else if (this.element.canPlayType("application/vnd.apple.mpegurl")) {
            this.element.src = this.currentStation.hls;
            this.element.addEventListener("loadedmetadata", () => {
                this.statusText = "SYSTEM_ONLINE";
            });
        }
    }

    async setStation(station: Station) {
        if (this.currentStation.id === station.id) return;

        const wasPlaying = this.isPlaying;

        // Reset state immediately to prevent UI race conditions
        if (wasPlaying) {
            this.element?.pause();
            this.isPlaying = false;
        }

        this.currentStation = station;
        this.settings.stream.lastStationId = station.id;
        this.statusText = "SWITCHING...";

        // Ensure HLS is cleaned up before creating a new one
        if (this.hls) {
            this.hls.stopLoad();
            this.hls.detachMedia();
            this.hls.destroy();
            this.hls = undefined;
        }

        this.initHls();

        if (wasPlaying) {
            // Wait a tiny bit for the new HLS instance to be ready to attach
            await new Promise((resolve) => setTimeout(resolve, 50));
            await this.togglePlay();
        }
    }

    async togglePlay() {
        if (!this.element) return;
        if (this.playPromise) return; // Prevent overlapping play attempts

        if (this.isPlaying) {
            this.element.pause();
        } else {
            if (this.hls) {
                this.hls.startLoad();
                if (this.hls.liveSyncPosition && Number.isFinite(this.hls.liveSyncPosition)) {
                    this.element.currentTime = this.hls.liveSyncPosition;
                }
            }

            this.playPromise = this.element.play();

            const result = await ResultAsync.fromPromise(
                this.playPromise,
                (cause): AppError => ({
                    type: "STREAM_ERROR",
                    message: cause instanceof DOMException ? cause.name : String(cause),
                }),
            );

            this.playPromise = undefined;

            if (result.isErr()) {
                // Ignore AbortError as it's common when toggling quickly
                if (result.error.type === "STREAM_ERROR" && result.error.message !== "AbortError") {
                    console.error("Audio playback failed:", result.error);
                    this.statusText = "ERR: INTERFERENCE";
                    this.hls?.stopLoad();
                }
            }
        }
    }

    toggleMute() {
        if (!this.element) return;
        this.isMuted = !this.isMuted;
        this.element.muted = this.isMuted;
    }

    private startEffects() {
        this.stopEffects();
        this.visualizerInterval = setInterval(() => this.updateVisualizer(), 100) as unknown as number;
    }

    private stopEffects() {
        if (this.visualizerInterval) clearInterval(this.visualizerInterval);
    }

    private updateVisualizer() {
        if (!this.isPlaying || this.isMuted) {
            this.signalStrength = 0;
            return;
        }
        this.signalStrength = Math.random();
    }
}
