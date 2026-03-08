"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import RideOfferModal from "./RideOfferModal";

/**
 * DispatchListener handles real-time subscriptions for ride offers.
 * It manages a queue of dispatches and shows them sequentially.
 */
export default function DispatchListener({ onOfferChange }) {
    const { user } = useAuthUser();
    const [dispatchQueue, setDispatchQueue] = useState([]);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [isFetchingRide, setIsFetchingRide] = useState(false);

    // Subscribe to ride_dispatches
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`dispatches-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "ride_dispatches",
                    filter: `driver_id=eq.${user.id}`
                },
                (payload) => {
                    setDispatchQueue((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    // Manage the active modal (Queue handling)
    useEffect(() => {
        const processNextDispatch = async () => {
            if (!currentOffer && dispatchQueue.length > 0 && !isFetchingRide) {
                const nextDispatch = dispatchQueue[0];
                setDispatchQueue((prev) => prev.slice(1));

                setIsFetchingRide(true);
                try {
                    const data = await rideService.getRideById(nextDispatch.ride_id);
                    if (data.success) {
                        const offer = {
                            ...nextDispatch,
                            ride: data.ride
                        };
                        setCurrentOffer(offer);
                        onOfferChange?.(offer);
                    }
                } catch (error) {
                    console.error("Failed to fetch ride for dispatch:", error);
                } finally {
                    setIsFetchingRide(false);
                }
            }
        };

        processNextDispatch();
    }, [dispatchQueue, currentOffer, isFetchingRide, onOfferChange]);

    const handleAccept = useCallback((rideId) => {
        setCurrentOffer(null);
        onOfferChange?.(null);
    }, [onOfferChange]);

    const handleReject = useCallback((rideId) => {
        setCurrentOffer(null);
        onOfferChange?.(null);
    }, [onOfferChange]);

    const handleClose = useCallback(() => {
        setCurrentOffer(null);
        onOfferChange?.(null);
    }, [onOfferChange]);

    if (!currentOffer) return null;

    return (
        <RideOfferModal
            key={currentOffer.id}
            rideId={currentOffer.ride_id}
            rideData={currentOffer.ride} // Pass pre-fetched data
            expiresAt={currentOffer.expires_at}
            onAccept={handleAccept}
            onReject={handleReject}
            onClose={handleClose}
        />
    );
}
