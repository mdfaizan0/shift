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

    /**
     * Fetches details for a specific ride.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Ride data
     */
    getRideById: async (id) => {
        const response = await api.get(`/rides/${id}`);
        return response.data;
    },

    /**
     * Accepts a ride offer.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Status
     */
    acceptRide: async (id) => {
        const response = await api.post(`/rides/${id}/accept`);
        return response.data;
    },

    /**
     * Rejects a ride offer.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Status
     */
    rejectRide: async (id) => {
        const response = await api.post(`/rides/${id}/reject`);
        return response.data;
    },

    /**
     * Creates a new ride request.
     * @param {object} rideData - pickup/dropoff locations and coordinates
     * @returns {Promise<object>} Created ride data
     */
    createRide: async (rideData) => {
        const response = await api.post("/rides", rideData);
        return response.data;
    },

    /**
     * Triggers the search for nearby drivers for a ride.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Status
     */
    searchRide: async (id) => {
        const response = await api.post(`/rides/${id}/search`);
        return response.data;
    },

    /**
     * Sets the ride status to DRIVER_EN_ROUTE.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Status
     */
    enrouteRide: async (id) => {
        const response = await api.post(`/rides/${id}/enroute`);
        return response.data;
    },

    /**
     * Starts the ride after OTP verification.
     * @param {string} id - Ride ID
     * @param {string} otp - 4-digit OTP
     * @returns {Promise<object>} Status
     */
    startRide: async (id, otp) => {
        const response = await api.post(`/rides/${id}/start`, { otp });
        return response.data;
    },

    /**
     * Completes the ride.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Status
     */
    completeRide: async (id) => {
        const response = await api.post(`/rides/${id}/complete`);
        return response.data;
    },

    /**
     * Cancels the ride.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Status
     */
    cancelRide: async (id) => {
        const response = await api.post(`/rides/${id}/cancel`);
        return response.data;
    },

    /**
     * Fetches ride history for a specific role.
     * @param {string} role - 'rider' or 'driver'
     * @returns {Promise<object>} Ride history data
     */
    getRideHistory: async (role) => {
        const response = await api.get(`/rides/history/${role}`);
        return response.data;
    },
    /**
     * Fetches the current active ride for a specific role.
     * @param {string} role - 'rider' or 'driver'
     * @returns {Promise<object>} Active ride data
     */
    getActiveRide: async (role) => {
        const response = await api.get(`/rides/active?as=${role}`);
        return response.data;
    },

    /**
     * Marks a ride as paid (Cash).
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Status
     */
    markPaid: async (id) => {
        const response = await api.post(`/rides/${id}/mark-paid`);
        return response.data;
    },

    /**
     * Triggers Razorpay payment order creation for a ride.
     * @param {string} id - Ride ID
     * @returns {Promise<object>} Order data (order_id, amount, currency, key_id)
     */
    payOrder: async (id) => {
        const response = await api.post(`/rides/${id}/pay`);
        return response.data;
    },

    /**
     * Submits a review for a completed ride.
     * @param {string} id - Ride ID
     * @param {object} payload - { rating, comment }
     * @returns {Promise<object>} Status
     */
    submitReview: async (id, payload) => {
        const response = await api.post(`/rides/${id}/review`, payload);
        return response.data;
    }
};
