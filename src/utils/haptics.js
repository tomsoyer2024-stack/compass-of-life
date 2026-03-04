// Dummy haptics to resolve build errors and follow user's previous request to remove it.
export const haptic = {
    light: () => Promise.resolve(),
    medium: () => Promise.resolve(),
    heavy: () => Promise.resolve(),
    vibrate: () => Promise.resolve(),
    selection: () => Promise.resolve(),
    selectionChanged: () => Promise.resolve(),
    selectionEnd: () => Promise.resolve()
};
