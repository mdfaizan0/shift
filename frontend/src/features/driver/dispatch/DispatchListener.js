"use client";

import React, { useState, useEffect, useCallback } from "react";
import { realtimeService } from "@/lib/realtime";
import { useAuthUser } from "@/hooks/useAuthUser";
import RideOfferCard from "./RideOfferCard";
import { rideService } from "@/services/ride.service";
import { useDriver } from "../DriverProvider";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * DispatchListener handles real-time subscriptions for ride offers.
 * It manages multiple concurrent offers and displays them as floating cards.
 */
export default function DispatchListener({ onOfferChange, activeRide }) {
    const { user } = useAuthUser();
    const { setActiveRide } = useDriver();
    const [activeOffers, setActiveOffers] = useState([]);

    // Subscribe to ride_dispatches
    useEffect(() => {
        if (!user?.id || activeRide) return;

        const channel = realtimeService.subscribeToDriverDispatch(user.id, async (newDispatch) => {
            try {
                // Check if we already have this offer (avoid duplicates)
                if (activeOffers.some(o => o.id === newDispatch.id)) return;

                const data = await rideService.getRideById(newDispatch.ride_id);
                if (data.success) {
                    const newOffer = {
                        ...newDispatch,
                        ride: data.ride
                    };
                    setActiveOffers((prev) => [...prev, newOffer]);
                    onOfferChange?.(newOffer);
                }
            } catch (error) {
                console.error("Failed to fetch ride for new dispatch:", error);
            }
        });

        return () => {
            realtimeService.unsubscribe(channel);
        };
    }, [user?.id, activeOffers, onOfferChange]);

    const handleAccept = useCallback(async (rideId) => {
        try {
            const result = await rideService.acceptRide(rideId);
            if (result.success) {
                toast.success("Ride accepted! Check your dashboard for details.");
                // Remove this offer and potentially all other active offers 
                // (as a driver usually can't accept multiple simultaneous rides)
                setActiveRide(result.ride);
                setActiveOffers([]);
                onOfferChange?.(null);
            }
        } catch (error) {
            console.error("Failed to accept ride:", error);
            // Error handled by interceptor
            handleReject(rideId);
        }
    }, [onOfferChange]);

    const handleReject = useCallback(async (rideId, isAuto = false) => {
        try {
            if (!isAuto) {
                await rideService.rejectRide(rideId);
            }
        } catch (error) {
            console.error("Failed to reject ride:", error);
        } finally {
            setActiveOffers((prev) => prev.filter(o => o.ride_id !== rideId));
            if (activeOffers.length <= 1) onOfferChange?.(null);
        }
    }, [activeOffers, onOfferChange]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none w-full max-w-[420px] px-6 sm:px-0">
            <AnimatePresence>
                {[...activeOffers].reverse().map((offer) => (
                    <div key={offer.id} className="pointer-events-auto w-full">
                        <RideOfferCard
                            ride={offer.ride}
                            dispatch={offer}
                            onAccept={handleAccept}
                            onReject={handleReject}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
