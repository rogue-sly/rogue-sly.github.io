// global UI state
// used for the sidebar and other UI elements
export class UIStore {
    isOpen = $state(false);
    isZenMode = $state(false);

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
}

export const ui = new UIStore();
