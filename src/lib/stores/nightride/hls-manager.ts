import Hls from "hls.js";

type StatusCallback = (text: string) => void;

/**
 * Manages a single HLS.js instance (or native HLS fallback) for one audio element.
 * Pure class — no Svelte runes.
 */
export class HlsManager {
    private hls: Hls | undefined;
    private element: HTMLAudioElement | undefined;
    private onStatus: StatusCallback;

    constructor(onStatus: StatusCallback) {
        this.onStatus = onStatus;
    }

    get instance() {
        return this.hls;
    }

    /**
     * Attach an audio element and initialise HLS for the given URL.
     * If `useHls` is false the element src is set directly (MP3 mode).
     */
    init(element: HTMLAudioElement, url: string, useHls: boolean) {
        this.element = element;
        this.destroy();

        if (!useHls) {
            this.element.src = url;
            this.element.addEventListener("loadedmetadata", () => {
                this.onStatus("SYSTEM_ONLINE");
            });
            return;
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
            this.hls.loadSource(url);
            this.hls.attachMedia(this.element);

            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.onStatus("SYSTEM_ONLINE");
            });

            this.hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.onStatus("ERR: NETWORK");
                            if (
                                data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                                data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
                            ) {
                                this.hls?.loadSource(url);
                            } else {
                                this.hls?.startLoad();
                            }
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.onStatus("ERR: MEDIA");
                            this.hls?.recoverMediaError();
                            break;
                        default:
                            this.onStatus("ERR: FATAL");
                            this.destroy();
                            break;
                    }
                }
            });
        } else if (this.element.canPlayType("application/vnd.apple.mpegurl")) {
            // Native HLS (Safari)
            this.element.src = url;
            this.element.addEventListener("loadedmetadata", () => {
                this.onStatus("SYSTEM_ONLINE");
            });
        }
    }

    startLoad() {
        this.hls?.startLoad();
    }

    stopLoad() {
        this.hls?.stopLoad();
    }

    get liveSyncPosition() {
        return this.hls?.liveSyncPosition;
    }

    destroy() {
        if (this.hls) {
            this.hls.stopLoad();
            this.hls.detachMedia();
            this.hls.destroy();
            this.hls = undefined;
        }
    }
}
