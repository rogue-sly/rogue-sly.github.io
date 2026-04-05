/**
 * Manages a Web Audio API context, analyser node, and media element source.
 * Pure class — no Svelte runes.
 */
export class AudioContextManager {
    private audioContext: AudioContext | undefined;
    analyser: AnalyserNode | undefined;
    private source: MediaElementAudioSourceNode | undefined;

    /**
     * Creates the AudioContext and wires: element → analyser → destination.
     * Safe to call multiple times — only initialises once per element.
     */
    connect(element: HTMLAudioElement) {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        if (document.readyState !== "complete" && document.readyState !== "interactive") return;
        if (this.source) return; // already initialised

        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        this.source = this.audioContext.createMediaElementSource(element);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    resume() {
        if (this.audioContext?.state === "suspended") {
            this.audioContext.resume();
        }
    }

    disconnect() {
        if (this.audioContext?.state !== "closed") {
            this.audioContext?.close();
        }
        this.analyser?.disconnect();
        this.source?.disconnect();
    }
}
