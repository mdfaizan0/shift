import React, { useState, useEffect, useCallback } from "react";
import MapContainer from "@/features/map/MapContainer";
import RideBookingCard from "./RideBookingCard";
import RideStatusCard from "./RideStatusCard";
import RideStatusTimeline from "./RideStatusTimeline";
import { useAuthUser } from "@/hooks/useAuthUser";
import { rideService } from "@/services/ride.service";
import { realtimeService } from "@/lib/realtime";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const RiderDashboard = () => {
    const { user } = useAuthUser();
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [activeRide, setActiveRide] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
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

    // Parse PostGIS point string (SRID=4326;POINT(lng lat))
    const parsePoint = (pointStr) => {
        if (!pointStr) return null;
        try {
            const match = pointStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
            if (match) {
                return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
            }
        } catch (e) {
            console.error("Failed to parse point:", pointStr);
        }
        return null;
    };

    // 1. Fetch active ride on mount
    useEffect(() => {
        if (!user?.id) return;

        const checkActiveRide = async () => {
            try {
                const { data, error } = await supabase
                    .from("rides")
                    .select("*, driver:driver_id(*, profile:driver_profiles(*))")
                    .eq("rider_id", user.id)
                    .not("status", "in", '("COMPLETED","CANCELLED")')
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setActiveRide(data);
                    if (data.driver?.profile?.location) {
                        setDriverLocation(parsePoint(data.driver.profile.location));
                    }
                }
            } catch (err) {
                console.error("Error checking active ride:", err);
            }
        };

        checkActiveRide();
    }, [user?.id]);

    // 2. Real-time subscription for ride updates
    useEffect(() => {
        if (!user?.id) return;

        const channel = realtimeService.subscribeToRideUpdates(user.id, "rider_id", async (updatedRide) => {
            console.log("Ride update received (Rider):", updatedRide);

            // If it becomes ACCEPTED or state change requires refresh (to get driver details)
            if (updatedRide.status === "ACCEPTED" ||
                (updatedRide.status !== activeRide?.status && !updatedRide.driver)) {
                const detail = await rideService.getRideById(updatedRide.id);
                if (detail.success) {
                    setActiveRide(detail.ride);
                    return;
                }
            }
            setActiveRide(updatedRide);
        });

        return () => {
            realtimeService.unsubscribe(channel);
        };
    }, [user?.id, activeRide?.id, activeRide?.status]);

    // 3. Removed: Driver location subscription moved to MapContainer.js

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
                try {
                    const searchResult = await rideService.searchRide(newRide.id);
                    if (searchResult.success) {
                        setActiveRide(searchResult.ride);
                        toast.success("Ride requested! Searching for nearby drivers.");
                    }
                } catch (searchError) {
                    console.error("Search failed:", searchError);
                    // Even if search returns 400 (no drivers), the ride might still be in SEARCHING status
                    // We can refresh the ride status once more to be sure
                    const latest = await rideService.getRideById(newRide.id);
                    if (latest.success) setActiveRide(latest.ride);
                }
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

                {activeRide && (
                    <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <RideStatusTimeline currentStatus={activeRide.status} />
                    </section>
                )}

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
                        driverId={activeRide?.driver_id}
                        status={activeRide?.status || "IDLE"}
                    />
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
