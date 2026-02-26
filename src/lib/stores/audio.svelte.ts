import Hls from "hls.js";
import { settings } from "./settings.svelte";

const STREAM_URL = "https://stream.nightride.fm:8443/nightride/nightride.m3u8";

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
            this.hls.loadSource(STREAM_URL);
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
                                this.hls?.loadSource(STREAM_URL);
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
            this.element.src = STREAM_URL;
            this.element.addEventListener("loadedmetadata", () => {
                this.statusText = "SYSTEM_ONLINE";
            });
        }
    }

    async togglePlay() {
        if (!this.element) return;

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
