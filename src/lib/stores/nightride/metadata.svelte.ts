import { browser } from "$app/environment";
import { Result } from "neverthrow";
import type { NightrideTrack } from "$lib/types";
import type { AppError } from "$lib/errors";

/** Parse a raw SSE data string into a list of NightrideTrack objects. */
const parseTrackData = Result.fromThrowable(
    (raw: string): NightrideTrack[] => JSON.parse(raw),
    (cause): AppError => ({ type: "PARSE_ERROR", context: "Nightride SSE", cause }),
);

class MetadataStore {
    private eventSource: EventSource | null = null;
    private connectTimer: ReturnType<typeof setTimeout> | null = null;
    public tracks = $state<Record<string, NightrideTrack>>({});
    public error = $state<AppError | null>(null);

    public connect(delay: number = 0) {
        if (!browser) return;
        if (this.eventSource) return;

        if (delay > 0) {
            this.clearTimer();
            this.connectTimer = setTimeout(() => {
                this.connectTimer = null;
                this.connect(0);
            }, delay);
            return;
        }

        const connectResult = Result.fromThrowable(
            () => new EventSource("https://nightride.fm/meta"),
            (cause): AppError => ({ type: "CONNECTION_FAILED", cause }),
        )();

        if (connectResult.isErr()) {
            console.error("Failed to initialize EventSource:", connectResult.error);
            this.error = connectResult.error;
            return;
        }

        this.eventSource = connectResult.value;

        this.eventSource.onmessage = (event) => {
            const raw: string | undefined = event.data?.trim();
            if (!raw || !raw.startsWith("[")) return;

            const parseResult = parseTrackData(raw);

            if (parseResult.isErr()) {
                console.error("Failed to parse Nightride meta:", parseResult.error);
                return;
            }

            parseResult.value.forEach((track) => (this.tracks[track.station] = track));
            this.error = null;
        };

        this.eventSource.onerror = (event) => {
            console.error("Nightride EventSource error:", event);
            this.error = { type: "SIGNAL_LOST" };
            this.cleanup();

            // EventSource usually auto-reconnects, but if it's a fatal error
            // we'll try again manually after a delay.
            this.connect(5000);
        };
    }

    public disconnect() {
        this.clearTimer();
        this.cleanup();
    }

    private clearTimer() {
        if (this.connectTimer) {
            clearTimeout(this.connectTimer);
            this.connectTimer = null;
        }
    }

    private cleanup() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

export const metadata = new MetadataStore();
