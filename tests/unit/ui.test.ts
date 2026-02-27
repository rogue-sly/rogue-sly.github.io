import { describe, it, expect, beforeEach } from "vitest";
import { UIStore } from "$lib/stores/ui.svelte";

describe("UIStore", () => {
    let ui: UIStore;

    beforeEach(() => {
        ui = new UIStore();
    });

    it("starts with default closed state", () => {
        expect(ui.isOpen).toBe(false);
        expect(ui.isZenMode).toBe(false);
    });

    it("toggles sidebar state", () => {
        ui.toggle();
        expect(ui.isOpen).toBe(true);
        ui.toggle();
        expect(ui.isOpen).toBe(false);
    });

    it("explicitly opens and closes sidebar", () => {
        ui.open();
        expect(ui.isOpen).toBe(true);
        ui.close();
        expect(ui.isOpen).toBe(false);
    });

    it("toggles zen mode", () => {
        ui.toggleZenMode();
        expect(ui.isZenMode).toBe(true);
        ui.toggleZenMode();
        expect(ui.isZenMode).toBe(false);
    });
});
