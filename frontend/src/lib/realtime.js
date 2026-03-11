import { supabase } from "./supabase";

/**
 * Realtime utility for managing Supabase subscriptions.
 */
export const realtimeService = {
    /**
     * Subscribes to updates on the 'rides' table for a specific user.
     * @param {string} userId - The ID of the rider or driver.
     * @param {string} filterField - 'rider_id' or 'driver_id'.
     * @param {function} onUpdate - Callback for record updates.
     * @returns {object} Supabase channel.
     */
    subscribeToRideUpdates: (userId, filterField, onUpdate) => {
        if (!userId) return null;

        return supabase
            .channel(`ride-updates-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "rides",
                    filter: `${filterField}=eq.${userId}`,
                },
                (payload) => onUpdate(payload.new)
            )
            .subscribe();
    },

    /**
     * Subscribes to new ride offers for a driver.
     * @param {string} driverId - The driver's user ID.
     * @param {function} onInsert - Callback for new dispatches.
     * @returns {object} Supabase channel.
     */
    subscribeToDriverDispatch: (driverId, onInsert) => {
        if (!driverId) return null;

        return supabase
            .channel(`dispatches-${driverId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "ride_dispatches",
                    filter: `driver_id=eq.${driverId}`,
                },
                (payload) => onInsert(payload.new)
            )
            .subscribe();
    },

    /**
     * Subscribes to location updates for a specific driver.
     * @param {string} driverId - The driver's user ID.
     * @param {function} onUpdate - Callback for location changes.
     * @returns {object} Supabase channel.
     */
    subscribeToDriverLocation: (driverId, onUpdate) => {
        if (!driverId) return null;

        return supabase
            .channel(`driver-location-${driverId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "driver_profiles",
                    filter: `user_id=eq.${driverId}`,
                },
                (payload) => onUpdate(payload.new)
            )
            .subscribe();
    },

    /**
     * Unsubscribes from a channel.
     * @param {object} channel - The channel returned by a subscribe method.
     */
    unsubscribe: (channel) => {
        if (channel) {
            supabase.removeChannel(channel);
        }
    },
};
