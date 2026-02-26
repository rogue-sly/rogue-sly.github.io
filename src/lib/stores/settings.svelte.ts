import { browser } from "$app/environment";

interface Settings {
    visualizerEnabled: boolean;
    audioDrift: boolean;
    lowQualityMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    visualizerEnabled: true,
    audioDrift: true,
    lowQualityMode: false,
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
        get audioDrift() {
            return settings.audioDrift;
        },
        set audioDrift(value: boolean) {
            settings.audioDrift = value;
            this.save();
        },
        get lowQualityMode() {
            return settings.lowQualityMode;
        },
        set lowQualityMode(value: boolean) {
            settings.lowQualityMode = value;
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
