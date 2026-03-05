import L from "leaflet";

/**
 * Configure Leaflet default icons to fix issues with modern bundlers 
 * (missing icons due to asset path resolution).
 */
export const configureLeafletIcons = () => {
    // Delete existing icon defaults
    delete L.Icon.Default.prototype._getIconUrl;

    // Manually merge icon configurations
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
};
