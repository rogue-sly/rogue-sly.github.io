import { browser } from "$app/environment";

interface Settings {
    visualizerEnabled: boolean;
    lowQualityMode: boolean;
    volume: number;
}

const DEFAULT_SETTINGS: Settings = {
    visualizerEnabled: true,
    lowQualityMode: false,
    volume: 0.5,
};

function createSettings() {
    let settings = $state<Settings>(DEFAULT_SETTINGS);

    if (browser) {
        const stored = localStorage.getItem("settings");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                settings = { ...DEFAULT_SETTINGS, ...parsed };
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }

    return {
        get visualizerEnabled() {
            return settings.visualizerEnabled;
        },
        set visualizerEnabled(value: boolean) {
            settings.visualizerEnabled = value;
            this.save();
        },
        get lowQualityMode() {
            return settings.lowQualityMode;
        },
        set lowQualityMode(value: boolean) {
            settings.lowQualityMode = value;
            this.save();
        },
        get volume() {
            return settings.volume;
        },
        set volume(value: number) {
            settings.volume = value;
            this.save();
        },
        save() {
            if (browser) {
                localStorage.setItem("settings", JSON.stringify(settings));
            }
        },
    };
}

export const settings = createSettings();
