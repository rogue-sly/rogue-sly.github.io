import { goto } from "$app/navigation";
import { page } from "$app/state";
import { settings } from "$lib/stores/settings.svelte";
import { stream, STATIONS } from "$lib/stores/nightride";
import { sidebar } from "./sidebar.svelte";
import { zenMode } from "./zen-mode.svelte";
import { help } from "./help.svelte";

export type Keybinding = {
    /** The exact `e.key` value to match. */
    key: string;
    /** Display label(s) for the help overlay. Multiple entries = chord (e.g. Shift+G). */
    keys: string[];
    /** Human-readable description shown in the help overlay. */
    description: string;
    /** Grouping label used in the help overlay. */
    group: "Playback" | "Navigation" | "UI";
    /** The action to run when this key is pressed. */
    action: () => void;
};

const VOLUME_STEP = 0.05;

export const keybindings: Keybinding[] = [
    // Playback
    {
        key: " ",
        keys: ["Space"],
        description: "Play / Pause",
        group: "Playback",
        action: () => stream.togglePlay(),
    },
    {
        key: "m",
        keys: ["M"],
        description: "Mute / Unmute",
        group: "Playback",
        action: () => stream.toggleMute(),
    },
    {
        key: "+",
        keys: ["+"],
        description: "Volume up",
        group: "Playback",
        action: () => (settings.stream.volume = Math.min(1, settings.stream.volume + VOLUME_STEP)),
    },
    {
        key: "=",
        keys: ["="],
        description: "Volume up (equals key)",
        group: "Playback",
        action: () => (settings.stream.volume = Math.min(1, settings.stream.volume + VOLUME_STEP)),
    },
    {
        key: "-",
        keys: ["-"],
        description: "Volume down",
        group: "Playback",
        action: () => (settings.stream.volume = Math.max(0, settings.stream.volume - VOLUME_STEP)),
    },
    {
        key: "n",
        keys: ["N"],
        description: "Next station",
        group: "Playback",
        action: () => {
            const idx = STATIONS.findIndex((s) => s.id === stream.currentStation.id);
            stream.setStation(STATIONS[(idx + 1) % STATIONS.length]);
        },
    },
    {
        key: "p",
        keys: ["P"],
        description: "Previous station",
        group: "Playback",
        action: () => {
            const idx = STATIONS.findIndex((s) => s.id === stream.currentStation.id);
            stream.setStation(STATIONS[(idx - 1 + STATIONS.length) % STATIONS.length]);
        },
    },
    // Navigation
    {
        key: "g",
        keys: ["G"],
        description: "Scroll to top",
        group: "Navigation",
        action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
        key: "G",
        keys: ["Shift", "G"],
        description: "Scroll to bottom",
        group: "Navigation",
        action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
    },
    {
        key: "b",
        keys: ["B"],
        description: "Back to blog",
        group: "Navigation",
        action: () => {
            if (page.url.pathname.startsWith("/blog/") && page.url.pathname !== "/blog/") {
                goto("/blog/");
            }
        },
    },
    // UI
    {
        key: "s",
        keys: ["S"],
        description: "Toggle sidebar",
        group: "UI",
        action: () => sidebar.toggle(),
    },
    {
        key: "z",
        keys: ["Z"],
        description: "Toggle zen mode",
        group: "UI",
        action: () => zenMode.toggle(),
    },
    {
        key: "Escape",
        keys: ["Esc"],
        description: "Close sidebar / help",
        group: "UI",
        action: () => {
            if (help.isOpen) help.toggle();
            if (sidebar.isOpen) sidebar.close();
        },
    },
    {
        key: "?",
        keys: ["?"],
        description: "Show this help",
        group: "UI",
        action: () => help.toggle(),
    },
];
