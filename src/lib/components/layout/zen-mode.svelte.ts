function createZenMode() {
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

export const zenMode = createZenMode();
