import { describe, it, expect, beforeEach } from "vitest";
import { SidebarStore } from "$lib/stores/ui/sidebar.svelte";
import { ZenModeStore } from "$lib/stores/ui/zen-mode.svelte";
import { ScannerStore } from "$lib/stores/ui/scanner.svelte";
import { HelpStore } from "$lib/stores/ui/help.svelte";

describe("SidebarStore", () => {
    let sidebar: SidebarStore;

    beforeEach(() => {
        sidebar = new SidebarStore();
    });

    it("starts closed", () => {
        expect(sidebar.isOpen).toBe(false);
    });

    it("toggles open and closed", () => {
        sidebar.toggle();
        expect(sidebar.isOpen).toBe(true);
        sidebar.toggle();
        expect(sidebar.isOpen).toBe(false);
    });

    it("closes explicitly", () => {
        sidebar.toggle();
        expect(sidebar.isOpen).toBe(true);
        sidebar.close();
        expect(sidebar.isOpen).toBe(false);
    });
});

describe("ZenModeStore", () => {
    let zenMode: ZenModeStore;

    beforeEach(() => {
        zenMode = new ZenModeStore();
    });

    it("starts with zen mode off", () => {
        expect(zenMode.isZenMode).toBe(false);
    });

    it("toggles zen mode", () => {
        zenMode.toggle();
        expect(zenMode.isZenMode).toBe(true);
        zenMode.toggle();
        expect(zenMode.isZenMode).toBe(false);
    });
});

describe("ScannerStore", () => {
    let scanner: ScannerStore;

    beforeEach(() => {
        scanner = new ScannerStore();
    });

    it("starts collapsed", () => {
        expect(scanner.isCollapsed).toBe(true);
    });

    it("toggles collapsed state", () => {
        scanner.toggle();
        expect(scanner.isCollapsed).toBe(false);
        scanner.toggle();
        expect(scanner.isCollapsed).toBe(true);
    });
});

describe("HelpStore", () => {
    let help: HelpStore;

    beforeEach(() => {
        help = new HelpStore();
    });

    it("starts closed", () => {
        expect(help.isOpen).toBe(false);
    });

    it("toggles open state", () => {
        help.toggle();
        expect(help.isOpen).toBe(true);
        help.toggle();
        expect(help.isOpen).toBe(false);
    });
});
