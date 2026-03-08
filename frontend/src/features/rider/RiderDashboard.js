import React, { useState, useEffect, useCallback } from "react";
import MapContainer from "@/features/map/MapContainer";
import RideBookingCard from "./RideBookingCard";
import RideStatusCard from "./RideStatusCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import { rideService } from "@/services/ride.service";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const RiderDashboard = () => {
    const { user } = useAuthUser();
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [activeRide, setActiveRide] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLocationSelect = useCallback((type, coords) => {
        if (activeRide) return; // Prevent selection during active ride

        if (type === "pickup") setPickup(coords);
        if (type === "drop") setDrop(coords);
        if (type === "reset") {
            setPickup(null);
            setDrop(null);
        }
    }, [activeRide]);

    // Real-time subscription for ride updates
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`rides-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "rides",
                    filter: `rider_id=eq.${user.id}`
                },
                (payload) => {
                    console.log("Ride update received:", payload);
                    if (payload.eventType === "DELETE") {
                        setActiveRide(null);
                        setPickup(null);
                        setDrop(null);
                    } else {
                        setActiveRide(payload.new);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const handleRideConfirm = async (rideData) => {
        setIsSubmitting(true);
        try {
            // 1. Create the ride
            const createResult = await rideService.createRide({
                rider_id: user.id,
                ...rideData
            });

            if (createResult.success) {
                const newRide = createResult.ride;
                setActiveRide(newRide);

                // 2. Immediately trigger dispatch search
                await rideService.searchRide(newRide.id);
                toast.success("Ride requested! Searching for nearby drivers.");
            }
        } catch (error) {
            console.error("Ride creation failed:", error);
            // Error handled by interceptor (toast)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex flex-col md:flex-row gap-6 min-h-[calc(100vh-10rem)]">
            {/* Sidebar / Controls Overlay */}
            <div className="w-full md:w-[400px] flex flex-col gap-6 z-10">
                <section>
                    <RideBookingCard
                        pickup={pickup}
                        drop={drop}
                        onConfirm={handleRideConfirm}
                        isSubmitting={isSubmitting}
                        isLocked={!!activeRide}
                    />
                </section>

                <section>
                    <RideStatusCard
                        status={activeRide?.status || "IDLE"}
                        rideData={activeRide}
                    />
                </section>

                <div className="hidden md:block flex-1 bg-linear-to-t from-muted/50 to-transparent rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground italic">
                        &quot;Your safety is our priority. Always check the taxi license before boarding.&quot;
                    </p>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full order-first md:order-last">
                <div className="sticky top-24 h-[400px] md:h-[calc(100vh-12rem)] min-h-[400px]">
                    <MapContainer
                        className="h-full w-full"
                        onLocationSelect={handleLocationSelect}
                        pickup={activeRide ? { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng } : pickup}
                        drop={activeRide ? { lat: activeRide.dropoff_lat, lng: activeRide.dropoff_lng } : drop}
                    />
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
