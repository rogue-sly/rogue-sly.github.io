function createZenMode() {
    let isZenMode = $state(false);

    return {
        get isZenMode() {
            return isZenMode;
        },
        toggle() {
            isZenMode = !isZenMode;
        },
    };
}

export const zenMode = createZenMode();
