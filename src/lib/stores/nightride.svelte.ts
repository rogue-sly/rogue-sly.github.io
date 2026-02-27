import { browser } from "$app/environment";
import { audioState } from "./audio.svelte";
import type { NightrideTrack } from "$lib/types";

class NightrideStore {
    private eventSource: EventSource | null = null;
    public tracks = $state<Record<string, NightrideTrack>>({});
    public error = $state<string | null>(null);
    public currentTrack = $derived(this.tracks[audioState.currentStation.id] || null);

    public connect() {
        if (!browser) return;
        if (this.eventSource) return;

        try {
            this.eventSource = new EventSource("https://nightride.fm/meta");
            this.eventSource.onmessage = (event) => {
                const raw: string | undefined = event.data?.trim();
                if (!raw || !raw.startsWith("[")) return;

                try {
                    const parsed: NightrideTrack[] = JSON.parse(raw);
                    parsed.forEach((track) => (this.tracks[track.station] = track));
                    this.error = null;
                } catch (error) {
                    console.error("Failed to parse Nightride meta:", error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error("Nightride EventSource error:", error);
                this.error = "SIGNAL_LOST";
                this.cleanup();

                // EventSource usually auto-reconnects, but if it's a fatal error
                // we'll try again manually after a delay.
                setTimeout(() => this.connect(), 5000);
            };
        } catch (error) {
            console.error("Failed to initialize EventSource:", error);
            this.error = "CONNECTION_FAILED";
        }
    }

    public disconnect() {
        this.cleanup();
    }

    private cleanup() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

export const nightride = new NightrideStore();
