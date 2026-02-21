// global UI state
// used for the sidebar
export class UIStore {
    isOpen = $state(false);

    toggle() {
        this.isOpen = !this.isOpen;
    }

    close() {
        this.isOpen = false;
    }

    open() {
        this.isOpen = true;
    }
}

export const ui = new UIStore();
