/**
 * Utility functions for map marker data formatting and calculations.
 */

/**
 * Creates a marker object structure.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} id - Unique identifier
 * @param {string} type - Marker type
 * @returns {object} Marker object
 */
export const createMarker = (lat, lng, id, type = "default", metadata = {}) => {
    return { id, lat, lng, type, metadata };
};

/**
 * Calculates the bearing (angle relative to North) between two points.
 * @returns {number} Bearing in degrees (0-360)
 */
export const calculateBearing = (startLat, startLng, destLat, destLng) => {
    const toRad = deg => (deg * Math.PI) / 180;
    const toDeg = rad => (rad * 180) / Math.PI;

    const lat1 = toRad(startLat);
    const lng1 = toRad(startLng);
    const lat2 = toRad(destLat);
    const lng2 = toRad(destLng);

    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);

    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
};

/**
 * Haversine formula to calculate distance between two coordinates.
 * @returns {number} Distance in km.
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Estimate ETA in minutes given distance in km.
 * @param {number} distanceKm
 * @param {number} speedKmh - Average speed, default 30 km/h for city driving.
 * @returns {number} ETA in minutes.
 */
export const estimateETA = (distanceKm, speedKmh = 30) => {
    if (!distanceKm || distanceKm <= 0) return 0;
    return Math.round((distanceKm / speedKmh) * 60);
};
