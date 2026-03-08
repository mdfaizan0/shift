/**
 * Calculate the remaining time in seconds from an expiry timestamp.
 * @param {string} expiresAt - ISO timestamp of when the dispatch expires.
 * @returns {number} - Seconds remaining, clamped to 0.
 */
export const calculateTimeLeft = (expiresAt) => {
    if (!expiresAt) return 0;
    const difference = +new Date(expiresAt) - +new Date();
    return Math.max(0, Math.floor(difference / 1000));
};

/**
 * Format seconds into a MM:SS string.
 * @param {number} seconds 
 * @returns {string}
 */
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};
