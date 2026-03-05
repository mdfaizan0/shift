import { ENV } from "@/lib/env";

/**
 * Map-related constants.
 */

export const MAP_CONFIG = {
    TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    DEFAULT_CENTER: [ENV.MAP_DEFAULT_LAT, ENV.MAP_DEFAULT_LNG],
    DEFAULT_ZOOM: ENV.MAP_DEFAULT_ZOOM,
};
