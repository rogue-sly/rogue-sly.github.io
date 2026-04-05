import { Result } from "neverthrow";
import type { NightrideTrack } from "$lib/types";
import type { AppError } from "$lib/errors";

/** Parse a raw SSE data string into a list of NightrideTrack objects. */
const parseTrackData = Result.fromThrowable(
    (raw: string): NightrideTrack[] => JSON.parse(raw),
    (cause): AppError => ({ type: "PARSE_ERROR", context: "Nightride SSE", cause }),
);

export class MetadataStore {
    private eventSource: EventSource | null = null;
    public tracks = $state<Record<string, NightrideTrack>>({});

    public connect() {
        this.eventSource = new EventSource("https://nightride.fm/meta");
        this.eventSource.onmessage = (event) => {
            const raw: string | undefined = event.data?.trim();
            if (!raw || !raw.startsWith("[")) return;

            const parseResult = parseTrackData(raw);

            if (parseResult.isErr()) {
                console.error("Failed to parse Nightride meta:", parseResult.error);
                return;
            }

            parseResult.value.forEach((track) => (this.tracks[track.station] = track));
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
