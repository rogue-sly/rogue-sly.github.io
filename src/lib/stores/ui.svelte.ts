// global UI state
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
