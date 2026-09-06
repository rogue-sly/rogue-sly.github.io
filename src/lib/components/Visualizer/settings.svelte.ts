import { browser } from "$app/environment";

function createSettings() {
    let enabled = $state(true);

    function save() {
        if (browser) {
            localStorage.setItem("settings", JSON.stringify({ enabled }));
        }
    }

    if (browser) {
        const stored = localStorage.getItem("settings");
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

export const settings = createSettings();
