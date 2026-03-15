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
export default function DispatchListener({ onOffersChange, activeRide }) {
    const { user } = useAuthUser();
    const { setActiveRide, isAvailable } = useDriver();
    const [activeOffers, setActiveOffers] = useState([]);
    const seenDispatchIds = React.useRef(new Set());

    useEffect(() => {
        if (!user?.id || activeRide || !isAvailable) {
            if (activeOffers.length > 0) {
                setActiveOffers([]);
                onOffersChange?.([]);
            }
            return;
        }

        const channel = realtimeService.subscribeToDriverDispatch(user.id, async (newDispatch) => {
            try {
                // Task 1: Prevent Duplicate Dispatches
                if (seenDispatchIds.current.has(newDispatch.id)) return;
                seenDispatchIds.current.add(newDispatch.id);

                // Add to list immediately (will be limited in render)
                const data = await rideService.getRideById(newDispatch.ride_id);
                if (data.success) {
                    const newOffer = {
                        ...newDispatch,
                        ride: data.ride
                    };
                    setActiveOffers((prev) => {
                        const updated = [newOffer, ...prev]; // Newest first
                        onOffersChange?.(updated);
                        return updated;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch ride for new dispatch:", error);
            }
        });

        return () => {
            realtimeService.unsubscribe(channel);
        };
    }, [user?.id, activeRide, isAvailable, onOffersChange]);

    const handleAccept = useCallback(async (rideId) => {
        try {
            const result = await rideService.acceptRide(rideId);
            if (result.success) {
                toast.success("Ride accepted! Check your dashboard for details.");
                setActiveRide(result.ride);
                setActiveOffers([]);
                onOffersChange?.([]);
            }
        } catch (error) {
            console.error("Failed to accept ride:", error);
            // Task 4: Handle Accept Failure
            // Removed from list and show specific fallback
            toast.error("Ride already accepted by another driver.");
            handleReject(rideId);
        }
    }, [onOffersChange, setActiveRide]);

    const handleReject = useCallback(async (rideId, isAuto = false) => {
        try {
            if (!isAuto) {
                await rideService.rejectRide(rideId);
            }
        } catch (error) {
            console.error("Failed to reject ride:", error);
        } finally {
            setActiveOffers((prev) => {
                const updated = prev.filter(o => o.ride_id !== rideId);
                onOffersChange?.(updated);
                return updated;
            });
        }
    }, [onOffersChange]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none w-full max-w-[420px] px-6 sm:px-0">
            <AnimatePresence>
                {/* Task 2: Limit visible cards to 3 */}
                {activeOffers.slice(0, 3).map((offer) => (
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
