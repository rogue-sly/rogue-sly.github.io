import { browser } from "$app/environment";

class VisualizerSettings {
    #parent: SettingsStore;
    #enabled = $state(true);
    #barCount = $state<16 | 32 | 64 | 128>(64);
    #barHeightScale = $state(0.3);
    #showGrid = $state(true);
    #showReflections = $state(true);
    #showSun = $state(true);
    #opacity = $state(0.6);
    #gridSpeed = $state(1.0);

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

    get barCount() {
        return this.#barCount;
    }

    set barCount(value: 16 | 32 | 64 | 128) {
        this.#barCount = value;
        this.#parent.save();
    }

    get barHeightScale() {
        return this.#barHeightScale;
    }

    set barHeightScale(value: number) {
        this.#barHeightScale = value;
        this.#parent.save();
    }

    get showGrid() {
        return this.#showGrid;
    }

    set showGrid(value: boolean) {
        this.#showGrid = value;
        this.#parent.save();
    }

    get showReflections() {
        return this.#showReflections;
    }

    set showReflections(value: boolean) {
        this.#showReflections = value;
        this.#parent.save();
    }

    get showSun() {
        return this.#showSun;
    }

    set showSun(value: boolean) {
        this.#showSun = value;
        this.#parent.save();
    }

    get opacity() {
        return this.#opacity;
    }

    set opacity(value: number) {
        this.#opacity = value;
        this.#parent.save();
    }

    get gridSpeed() {
        return this.#gridSpeed;
    }

    set gridSpeed(value: number) {
        this.#gridSpeed = value;
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

export class SettingsStore {
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
                        if (parsed.visualizer.enabled !== undefined)
                            this.visualizer.enabled = parsed.visualizer.enabled;
                        if (parsed.visualizer.barCount !== undefined)
                            this.visualizer.barCount = parsed.visualizer.barCount;
                        if (parsed.visualizer.barHeightScale !== undefined)
                            this.visualizer.barHeightScale = parsed.visualizer.barHeightScale;
                        if (parsed.visualizer.showGrid !== undefined)
                            this.visualizer.showGrid = parsed.visualizer.showGrid;
                        if (parsed.visualizer.showReflections !== undefined)
                            this.visualizer.showReflections = parsed.visualizer.showReflections;
                        if (parsed.visualizer.showSun !== undefined)
                            this.visualizer.showSun = parsed.visualizer.showSun;
                        if (parsed.visualizer.opacity !== undefined)
                            this.visualizer.opacity = parsed.visualizer.opacity;
                        if (parsed.visualizer.gridSpeed !== undefined)
                            this.visualizer.gridSpeed = parsed.visualizer.gridSpeed;
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
                        barCount: this.visualizer.barCount,
                        barHeightScale: this.visualizer.barHeightScale,
                        showGrid: this.visualizer.showGrid,
                        showReflections: this.visualizer.showReflections,
                        showSun: this.visualizer.showSun,
                        opacity: this.visualizer.opacity,
                        gridSpeed: this.visualizer.gridSpeed,
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
