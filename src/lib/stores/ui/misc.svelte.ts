// Scanner, Zen Mode, Etc...
export class MiscStore {
    isZenMode = $state(false);
    isScannerCollapsed = $state(true);
    isHelpOpen = $state(false);

    toggleZenMode() {
        this.isZenMode = !this.isZenMode;
    }

    toggleScanner() {
        this.isScannerCollapsed = !this.isScannerCollapsed;
    }

    toggleHelp() {
        this.isHelpOpen = !this.isHelpOpen;
    }
}

export const misc = new MiscStore();
