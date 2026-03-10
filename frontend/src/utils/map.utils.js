/**
 * Utility functions for map marker data formatting.
 */

/**
 * Creates a marker object structure.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} id - Unique identifier
 * @returns {object} Marker object
 */
export const createMarker = (lat, lng, id, type = "default") => {
    return {
        id,
        lat,
        lng,
        type,
    };
};
