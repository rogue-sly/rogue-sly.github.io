export class ZenModeStore {
    isZenMode = $state(false);

    toggle() {
        this.isZenMode = !this.isZenMode;
    }
}

export const zenMode = new ZenModeStore();
