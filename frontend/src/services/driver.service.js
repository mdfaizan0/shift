import api from "@/lib/api";

/**
 * Driver service for handling driver-specific API calls.
 */
export const driverService = {
    /**
     * Sets the driver status to online.
     * @returns {Promise<object>} Updated driver profile
     */
    goOnline: async () => {
        const response = await api.post("/driver/go-online");
        return response.data;
    },

    /**
     * Sets the driver status to offline.
     * @returns {Promise<object>} Updated driver profile
     */
    goOffline: async () => {
        const response = await api.post("/driver/go-offline");
        return response.data;
    },

    /**
     * Fetches the current driver profile.
     * @returns {Promise<object>} Driver profile data
     */
    getProfile: async () => {
        const response = await api.get("/driver/profile");
        return response.data;
    },

    /**
     * Toggles the driver's availability for rides.
     * @returns {Promise<object>} Availability state
     */
    toggleAvailability: async () => {
        const response = await api.post("/driver/toggle");
        return response.data;
    }
};
