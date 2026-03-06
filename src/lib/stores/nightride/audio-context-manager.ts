/**
 * Manages a Web Audio API context, analyser node, and media element source.
 * Pure class — no Svelte runes.
 */
export class AudioContextManager {
    audioCtx: AudioContext | undefined;
    analyser: AnalyserNode | undefined;
    private source: MediaElementAudioSourceNode | undefined;

    /**
     * Creates the AudioContext and wires: element → analyser → destination.
     * Safe to call multiple times — only initialises once per element.
     */
    init(element: HTMLAudioElement) {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        if (document.readyState !== "complete" && document.readyState !== "interactive") return;
        if (this.source) return; // already initialised

        const AudioContextCtor =
            window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        this.audioCtx = new AudioContextCtor();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;

        this.source = this.audioCtx.createMediaElementSource(element);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
    }

    resume() {
        if (this.audioCtx?.state === "suspended") {
            this.audioCtx.resume();
        }
    }
}
