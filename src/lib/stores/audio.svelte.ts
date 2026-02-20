// Global Audio state
export class AudioStore {
    element: HTMLAudioElement | undefined = $state();
    isPlaying = $state(false);
    isMuted = $state(false);
    volume = $state(0.5);
    statusText = $state("SYSTEM_OFFLINE");
    signalStrength = $state(0);
    
    private driftInterval: number | undefined;
    private visualizerInterval: number | undefined;

    constructor() {
        // Any initialization logic if needed
    }

    setElement(el: HTMLAudioElement) {
        this.element = el;
        if (this.element) {
            this.element.volume = this.volume;
            this.element.muted = this.isMuted;
        }
    }

    togglePlay() {
        if (!this.element) return;

        if (this.isPlaying) {
            this.element.pause();
            this.isPlaying = false;
            this.statusText = "SIGNAL_LOST";
            this.signalStrength = 0;
            this.stopEffects();
        } else {
            this.element.play().then(() => {
                this.isPlaying = true;
                this.statusText = "RECEIVING...";
                this.startEffects();
            }).catch(e => {
                console.error("Audio playback failed:", e);
                this.statusText = "ERR: INTERFERENCE";
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
