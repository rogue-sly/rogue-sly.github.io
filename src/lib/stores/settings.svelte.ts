import { Result } from "neverthrow";
import { type AppError, appErrorMessage } from "$lib/errors";
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

    toJSON() {
        return {
            enabled: this.#enabled,
            barCount: this.#barCount,
            barHeightScale: this.#barHeightScale,
            showGrid: this.#showGrid,
            showReflections: this.#showReflections,
            showSun: this.#showSun,
            opacity: this.#opacity,
            gridSpeed: this.#gridSpeed,
        };
    }

    fromJSON(data: Record<string, unknown>) {
        if (typeof data.enabled === "boolean") this.#enabled = data.enabled;

        if (data.barCount === 16 || data.barCount === 32 || data.barCount === 64 || data.barCount === 128)
            this.#barCount = data.barCount;

        if (typeof data.barHeightScale === "number") this.#barHeightScale = data.barHeightScale;
        if (typeof data.showGrid === "boolean") this.#showGrid = data.showGrid;
        if (typeof data.showReflections === "boolean") this.#showReflections = data.showReflections;
        if (typeof data.showSun === "boolean") this.#showSun = data.showSun;
        if (typeof data.opacity === "number") this.#opacity = data.opacity;
        if (typeof data.gridSpeed === "number") this.#gridSpeed = data.gridSpeed;
    }

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
    #lastStationId = $state("nightride");

    toJSON() {
        return {
            volume: this.#volume,
            lastStationId: this.#lastStationId,
        };
    }

    fromJSON(data: Record<string, unknown>) {
        if (typeof data.volume === "number") this.#volume = data.volume;
        if (typeof data.lastStationId === "string") this.#lastStationId = data.lastStationId;
    }

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
            const parseJSON = Result.fromThrowable(
                JSON.parse,
                (cause): AppError => ({ type: "PARSE_ERROR", context: "localStorage settings", cause }),
            );

            const stored = localStorage.getItem("settings");
            if (!stored) return;

            const result = parseJSON(stored);
            if (!result.isOk()) {
                console.error(appErrorMessage(result.error), result.error.type);
                return;
            }

            const parsed = result.value;
            if (parsed.visualizer) this.visualizer.fromJSON(parsed.visualizer);
            if (parsed.stream) this.stream.fromJSON(parsed.stream);
        }
    }

    save() {
        if (browser) {
            localStorage.setItem(
                "settings",
                JSON.stringify({
                    visualizer: this.visualizer.toJSON(),
                    stream: this.stream.toJSON(),
                }),
            );
        }
    }
}

export const settings = new SettingsStore();
