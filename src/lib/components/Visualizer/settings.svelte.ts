export interface VisualizerSettings {
    readonly enabled: boolean;
    toggle(): void;
}

export function createSettings(storage?: Storage | null): VisualizerSettings {
    let enabled = $state(true);

    function save() {
        storage?.setItem("settings", JSON.stringify({ enabled }));
    }

    if (storage) {
        const stored = storage.getItem("settings");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (typeof parsed.enabled === "boolean") enabled = parsed.enabled;
            } catch (e) {
                console.error("Failed to parse settings from localStorage:", e);
            }
        }
    }

    return {
        get enabled() {
            return enabled;
        },
        toggle() {
            enabled = !enabled;
            save();
        },
    };
}
