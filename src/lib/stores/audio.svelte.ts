import Hls from "hls.js";

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
    volume = $state(0.5);
    statusText = $state("SYSTEM_OFFLINE");
    signalStrength = $state(0);

    private driftInterval: number | undefined;
    private visualizerInterval: number | undefined;

    constructor() {}

    setElement(el: HTMLAudioElement) {
        this._element = el;
        if (this._element) {
            this._element.volume = this.volume;
            this._element.muted = this.isMuted;

            this._element.addEventListener("play", () => {
                this.isPlaying = true;
                this.statusText = "RECEIVING...";
                this.startEffects();
                // Ensure HLS is loading if play was triggered externally
                if (this.hls) this.hls.startLoad();
            });

            this._element.addEventListener("playing", () => {
                this.statusText = "RECEIVING...";
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

    private initHls() {
        if (!this.element) return;

        // Cleanup previous HLS instance if exists
        if (this.hls) {
            this.hls.destroy();
            this.hls = undefined;
        }

        const streamUrl = "https://stream.nightride.fm:8443/nightride/nightride.m3u8";

        if (Hls.isSupported()) {
            this.hls = new Hls({
                autoStartLoad: false,
            });
            this.hls.loadSource(streamUrl);
            this.hls.attachMedia(this.element);

            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.statusText = "SYSTEM_ONLINE";
                // If we are starting playback, jump to live edge
                if (this.isPlaying && this.hls?.liveSyncPosition) {
                    this.element!.currentTime = this.hls.liveSyncPosition;
                }
            });

            this.hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.statusText = "ERR: NETWORK";
                            console.error("fatal network error encountered, try to recover");
                            this.hls?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.statusText = "ERR: MEDIA";
                            console.error("fatal media error encountered, try to recover");
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
            // Safari support
            this.element.src = streamUrl;
            this.element.addEventListener("loadedmetadata", () => {
                this.statusText = "SYSTEM_ONLINE";
            });
        }
    }

    togglePlay() {
        if (!this.element) return;

        if (this.isPlaying) {
            this.element.pause();
        } else {
            if (this.hls) {
                this.hls.startLoad();
                // If resuming after a pause, we want to skip stale buffer and jump to live edge
                if (this.hls.liveSyncPosition && Number.isFinite(this.hls.liveSyncPosition)) {
                    this.element.currentTime = this.hls.liveSyncPosition;
                }
            }
            this.element.play().catch((e) => {
                console.error("Audio playback failed:", e);
                this.statusText = "ERR: INTERFERENCE";
                this.hls?.stopLoad();
            });
        }
    }

    toggleMute() {
        if (!this.element) return;
        this.isMuted = !this.isMuted;
        this.element.muted = this.isMuted;
    }

    private startEffects() {
        // Clear any existing intervals first just in case
        this.stopEffects();

        // Start drifting immediately
        this.drift();

        // Set intervals
        this.driftInterval = setInterval(() => this.drift(), 2000) as unknown as number;
        this.visualizerInterval = setInterval(() => this.updateVisualizer(), 100) as unknown as number;
    }

    private stopEffects() {
        if (this.driftInterval) clearInterval(this.driftInterval);
        if (this.visualizerInterval) clearInterval(this.visualizerInterval);
    }

    private drift() {
        if (!this.isPlaying || this.isMuted || !this.element) return;

        // Randomly change volume by small amount
        const change = (Math.random() - 0.5) * 0.1;
        let newVol = this.volume + change;

        // Clamp volume between 0.3 and 0.8
        if (newVol > 0.8) newVol = 0.8;
        if (newVol < 0.3) newVol = 0.3;

        this.volume = newVol;
        this.element.volume = this.volume;
    }

    private updateVisualizer() {
        if (!this.isPlaying || this.isMuted) {
            this.signalStrength = 0;
            return;
        }
        // distinct from volume drift, just visual noise
        this.signalStrength = Math.random();
    }
}

export const audioState = new AudioStore();
