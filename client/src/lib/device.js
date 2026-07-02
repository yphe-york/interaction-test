/**
 * Determines the participant's current device category.
 *
 * This should only run in the browser.
 */
export function detectDevice() {
    if (typeof window === "undefined") {
        return "desktop";
    }

    const width = window.innerWidth;

    if (width < 768) {
        return "mobile";
    }

    if (width < 1024) {
        return "tablet";
    }

    return "desktop";
}