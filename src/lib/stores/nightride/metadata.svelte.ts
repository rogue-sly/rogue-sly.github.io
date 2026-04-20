import type { NightrideTrack } from "$lib/types";

export class MetadataStore {
    private eventSource: EventSource | null = null;
    public tracks = $state<Record<string, NightrideTrack>>({});

    public connect() {
        this.eventSource = new EventSource("https://nightride.fm/meta");
        this.eventSource.onmessage = (event) => {
            const raw: string | undefined = event.data?.trim();
            if (!raw || !raw.startsWith("[")) return;

            try {
                const parsed: NightrideTrack[] = JSON.parse(raw);
                parsed.forEach((track) => (this.tracks[track.station] = track));
            } catch (e) {
                console.error("Failed to parse Nightride meta:", e);
            }
        };

        this.eventSource.onerror = () => {
            this.disconnect();
            setTimeout(() => this.connect(), 5000);
        };

        addEventListener("beforeunload", () => {
            this.disconnect();
        });
    }

    public disconnect() {
        if (this.eventSource) this.eventSource.close();
    }
}
