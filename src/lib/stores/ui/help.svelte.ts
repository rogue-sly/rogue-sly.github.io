export class HelpStore {
    isOpen = $state(false);

    toggle() {
        this.isOpen = !this.isOpen;
    }
}

export const help = new HelpStore();
