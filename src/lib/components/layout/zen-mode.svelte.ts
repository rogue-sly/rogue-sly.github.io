export interface ZenMode {
    readonly enabled: boolean;
    toggle(): void;
}

export function createZenMode(): ZenMode {
    let enabled = $state(false);

    return {
        get enabled() {
            return enabled;
        },
        toggle() {
            enabled = !enabled;
        },
    };
}
