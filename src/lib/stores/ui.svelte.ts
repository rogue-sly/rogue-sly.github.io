// global UI state
// used for the sidebar and other UI elements
export class UIStore {
    isOpen = $state(false);
    isZenMode = $state(false);
    isScannerCollapsed = $state(true);

    toggle() {
        this.isOpen = !this.isOpen;
    }

    close() {
        this.isOpen = false;
    }

    open() {
        this.isOpen = true;
    }

    toggleZenMode() {
        this.isZenMode = !this.isZenMode;
    }

    toggleScanner() {
        this.isScannerCollapsed = !this.isScannerCollapsed;
    }
}

export const ui = new UIStore();
