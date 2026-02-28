import { describe, it, expect, beforeEach } from "vitest";
import { SidebarStore } from "$lib/stores/ui/sidebar.svelte";
import { MiscStore } from "$lib/stores/ui/misc.svelte";

describe("UIStore", () => {
    let sidebar: SidebarStore;
    let misc: MiscStore;

    beforeEach(() => {
        sidebar = new SidebarStore();
        misc = new MiscStore();
    });

    it("starts with default closed state", () => {
        expect(sidebar.isOpen).toBe(false);
        expect(misc.isZenMode).toBe(false);
    });

    it("toggles sidebar state", () => {
        sidebar.toggle();
        expect(sidebar.isOpen).toBe(true);
        sidebar.toggle();
        expect(sidebar.isOpen).toBe(false);
    });

    it("explicitly opens and closes sidebar", () => {
        sidebar.open();
        expect(sidebar.isOpen).toBe(true);
        sidebar.close();
        expect(sidebar.isOpen).toBe(false);
    });

    it("toggles zen mode", () => {
        misc.toggleZenMode();
        expect(misc.isZenMode).toBe(true);
        misc.toggleZenMode();
        expect(misc.isZenMode).toBe(false);
    });
});
