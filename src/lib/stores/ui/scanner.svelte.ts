export class ScannerStore {
    isCollapsed = $state(true);

    toggle() {
        this.isCollapsed = !this.isCollapsed;
    }
}

export const scanner = new ScannerStore();
