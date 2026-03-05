import { browser } from "$app/environment";

class VisualizerSettings {
    #parent: SettingsStore;
    #enabled = $state(true);
    #lowQualityMode = $state(false);

    constructor(parent: SettingsStore) {
        this.#parent = parent;
    }

    get enabled() {
        return this.#enabled;
    }

    set enabled(value: boolean) {
        this.#enabled = value;
        this.#parent.save();
    }

    get lowQualityMode() {
        return this.#lowQualityMode;
    }

    set lowQualityMode(value: boolean) {
        this.#lowQualityMode = value;
        this.#parent.save();
    }
}

class StreamSettings {
    #parent: SettingsStore;
    #volume = $state(0.5);
    #format = $state<"mp3" | "hls">("mp3");
    #lastStationId = $state("nightride");

    constructor(parent: SettingsStore) {
        this.#parent = parent;
    }

    get volume() {
        return this.#volume;
    }

    set volume(value: number) {
        this.#volume = value;
        this.#parent.save();
    }

    get format() {
        return this.#format;
    }

    set format(value: "mp3" | "hls") {
        this.#format = value;
        this.#parent.save();
    }

    get lastStationId() {
        return this.#lastStationId;
    }

    set lastStationId(value: string) {
        this.#lastStationId = value;
        this.#parent.save();
    }
}

class SettingsStore {
    visualizer: VisualizerSettings;
    stream: StreamSettings;

    constructor() {
        this.visualizer = new VisualizerSettings(this);
        this.stream = new StreamSettings(this);

        if (browser) {
            const stored = localStorage.getItem("settings");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.visualizer) {
                        this.visualizer.enabled = parsed.visualizer.enabled;
                        this.visualizer.lowQualityMode = parsed.visualizer.lowQualityMode;
                    }
                    if (parsed.stream) {
                        this.stream.volume = parsed.stream.volume;
                        this.stream.format = parsed.stream.format;
                        if (parsed.stream.lastStationId) {
                            this.stream.lastStationId = parsed.stream.lastStationId;
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse settings", e);
                }
            }
        }
    }

    save() {
        if (browser) {
            localStorage.setItem(
                "settings",
                JSON.stringify({
                    visualizer: {
                        enabled: this.visualizer.enabled,
                        lowQualityMode: this.visualizer.lowQualityMode,
                    },
                    stream: {
                        volume: this.stream.volume,
                        format: this.stream.format,
                        lastStationId: this.stream.lastStationId,
                    },
                }),
            );
        }
    }
}

export const settings = new SettingsStore();
