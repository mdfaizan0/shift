import api from "@/lib/api";

/**
 * Ride service for handling ride-related API calls.
 */
export const rideService = {
    /**
     * Estimates the fare for a ride based on pickup and drop-off coordinates.
     * @param {object} coords - Pickup and drop-off coordinates
     * @returns {Promise<object>} Fare estimate data
     */
    estimateFare: async (coords) => {
        const response = await api.post("/rides/estimate", {
            pickup_lat: coords.pickup_lat,
            pickup_lng: coords.pickup_lng,
            dropoff_lat: coords.dropoff_lat,
            dropoff_lng: coords.dropoff_lng,
        });
        return response.data;
    },
};
