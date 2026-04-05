import type { SettingsStore } from "../settings.svelte";
import { MetadataStore } from "./metadata.svelte";
import { STATIONS, StreamStore } from "./stream.svelte";

export { STATIONS, type StreamStore, type MetadataStore };

export class NightrideRadio {
    stream: StreamStore;
    metadata: MetadataStore;

    constructor(settings: SettingsStore) {
        this.stream = new StreamStore(settings);
        this.metadata = new MetadataStore();
    }

    connect(element: HTMLAudioElement | undefined) {
        if (element) this.stream.element = element;
        this.metadata.connect();
    }

    disconnect() {
        this.stream.disconnect();
        this.metadata.disconnect();
    }
}
