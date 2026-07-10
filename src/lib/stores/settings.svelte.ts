import { browser } from "$app/environment";

class VisualizerSettings {
    #parent: SettingsStore;
    #enabled = $state(true);
    #showGrid = $state(true);
    #showSun = $state(true);
    #opacity = $state(0.6);
    #gridSpeed = $state(1.0);

    toJSON() {
        return {
            enabled: this.#enabled,
            showGrid: this.#showGrid,
            showSun: this.#showSun,
            opacity: this.#opacity,
            gridSpeed: this.#gridSpeed,
        };
    }

    fromJSON(data: Record<string, unknown>) {
        if (typeof data.enabled === "boolean") this.#enabled = data.enabled;

        if (typeof data.showGrid === "boolean") this.#showGrid = data.showGrid;
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

    get showGrid() {
        return this.#showGrid;
    }

    set showGrid(value: boolean) {
        this.#showGrid = value;
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

export class SettingsStore {
    visualizer: VisualizerSettings;

    constructor() {
        this.visualizer = new VisualizerSettings(this);

        if (browser) {
            const stored = localStorage.getItem("settings");
            if (!stored) return;

            try {
                const parsed = JSON.parse(stored);
                if (parsed.visualizer) this.visualizer.fromJSON(parsed.visualizer);
            } catch (e) {
                console.error("Failed to parse settings from localStorage:", e);
            }
        }
    }

    save() {
        if (browser) {
            localStorage.setItem(
                "settings",
                JSON.stringify({
                    visualizer: this.visualizer.toJSON(),
                }),
            );
        }
    }
}

export const settings = new SettingsStore();
