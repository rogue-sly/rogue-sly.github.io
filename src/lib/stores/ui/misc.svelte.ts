// Scanner, Zen Mode, Etc...
export class MiscStore {
    isZenMode = $state(false);
    isScannerCollapsed = $state(true);

    toggleZenMode() {
        this.isZenMode = !this.isZenMode;
    }

    toggleScanner() {
        this.isScannerCollapsed = !this.isScannerCollapsed;
    }
}

export const misc = new MiscStore();
