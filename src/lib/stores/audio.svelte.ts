import Hls from "hls.js";
import { settings } from "./settings.svelte";
import type { Station } from "$lib/types";

export const STATIONS: Station[] = [
    {
        id: "nightride",
        name: "Nightride",
        url: "https://stream.nightride.fm:8443/nightride/nightride.m3u8",
    },
    {
        id: "chillsynth",
        name: "Chillsynth",
        url: "https://stream.nightride.fm:8443/chillsynth/chillsynth.m3u8",
    },
    {
        id: "datawave",
        name: "Datawave",
        url: "https://stream.nightride.fm:8443/datawave/datawave.m3u8",
    },
    {
        id: "spacesynth",
        name: "Spacesynth",
        url: "https://stream.nightride.fm:8443/spacesynth/spacesynth.m3u8",
    },
    {
        id: "darksynth",
        name: "Darksynth",
        url: "https://stream.nightride.fm:8443/darksynth/darksynth.m3u8",
    },
    {
        id: "horrorsynth",
        name: "Horrorsynth",
        url: "https://stream.nightride.fm:8443/horrorsynth/horrorsynth.m3u8",
    },
    {
        id: "ebsm",
        name: "EBSM",
        url: "https://stream.nightride.fm:8443/ebsm/ebsm.m3u8",
    },
] as const;

// Global Audio state
export class AudioStore {
    private _element: HTMLAudioElement | undefined = $state();

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
    currentStation: Station = $state(STATIONS[0]);

    private visualizerInterval: number | undefined;

    audioCtx: AudioContext | undefined;
    analyser: AnalyserNode | undefined;
    source: MediaElementAudioSourceNode | undefined;

    constructor() {}

    /**
     * Initializes reactive effects. Must be called within a Svelte effect scope
     * (e.g., in a component's script tag or onMount).
     */
    initEffects() {
        // Reactively update element volume when settings change
        $effect(() => {
            if (this._element) {
                this._element.volume = settings.volume;
            }
        });
    }

    setElement(el: HTMLAudioElement) {
        this._element = el;
        if (this._element) {
            this._element.volume = settings.volume;
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
            this.hls.loadSource(this.currentStation.url);
            this.hls.attachMedia(this.element);

            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.statusText = "SYSTEM_ONLINE";
                if (this.isPlaying && this.hls?.liveSyncPosition) {
                    this.element!.currentTime = this.hls.liveSyncPosition;
                }
            });

            this.hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.statusText = "ERR: NETWORK";
                            if (
                                data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                                data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
                            ) {
                                this.hls?.loadSource(this.currentStation.url);
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
            this.element.src = this.currentStation.url;
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
            try {
                if (this.hls) {
                    this.hls.startLoad();
                    if (this.hls.liveSyncPosition && Number.isFinite(this.hls.liveSyncPosition)) {
                        this.element.currentTime = this.hls.liveSyncPosition;
                    }
                }

                this.playPromise = this.element.play();
                await this.playPromise;
            } catch (e: any) {
                // Ignore AbortError as it's common when toggling quickly
                if (e.name !== "AbortError") {
                    console.error("Audio playback failed:", e);
                    this.statusText = "ERR: INTERFERENCE";
                    this.hls?.stopLoad();
                }
            } finally {
                this.playPromise = undefined;
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

export const audioState = new AudioStore();
