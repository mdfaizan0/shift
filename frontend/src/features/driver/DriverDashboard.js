"use client";

import React from "react";
import MapContainer from "@/features/map/MapContainer";
import DriverAvailabilityCard from "./DriverAvailabilityCard";
import { DriverProvider, useDriver } from "./DriverProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Star, Radio } from "lucide-react";
import DispatchListener from "./dispatch/DispatchListener";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import ActiveRideCard from "./ActiveRideCard";

/**
 * Inner dashboard component that consumes DriverProvider.
 */
const DriverDashboardInternal = () => {
    const { isOnline, isAvailable, activeRide, isLoading } = useDriver();
    const [activeOffers, setActiveOffers] = React.useState([]);

    // Track and broadcast location while online
    const { refreshLocation } = useDriverLocation(isOnline);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] w-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Syncing Captain's Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col md:flex-row gap-6 min-h-[calc(100vh-10rem)]">
            {/* Real-time Dispatch Listener */}
            {isOnline && isAvailable && !activeRide && (
                <DispatchListener onOffersChange={setActiveOffers} activeRide={activeRide} />
            )}

            {/* Sidebar / Controls Overlay */}
            <div className="w-full md:w-[400px] flex flex-col gap-6 z-10">
                <section className="relative group">
                    {activeRide ? (
                        <ActiveRideCard ride={activeRide} />
                    ) : (
                        <DriverAvailabilityCard />
                    )}

                    {isOnline && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md z-20 hover:scale-110 active:scale-95 transition-all p-0"
                            onClick={refreshLocation}
                            title="Force Location Update"
                        >
                            <Radio className="h-4 w-4 text-primary animate-pulse" />
                        </Button>
                    )}
                </section>

                {/* ... rest of the sidebar code ... */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <IndianRupee className="h-4 w-4 text-primary mb-2" />
                            <span className="text-2xl font-bold">₹0</span>
                            <span className="text-xs text-muted-foreground">Today's Earnings</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <Star className="h-4 w-4 text-yellow-500 mb-2" />
                            <span className="text-2xl font-bold">5.0</span>
                            <span className="text-xs text-muted-foreground">Rating</span>
                        </CardContent>
                    </Card>
                </div>


                <div className="hidden md:block bg-linear-to-t from-muted/50 to-transparent rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground italic">
                        &quot;Drive responsibly. Your safety and the rider's safety are paramount.&quot;
                    </p>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full order-first md:order-last">
                <div className="sticky top-24 h-[400px] md:h-[calc(100vh-12rem)] min-h-[400px]">
                    <MapContainer
                        className="h-full w-full"
                        pickup={activeRide ? {
                            lat: activeRide.pickup_lat,
                            lng: activeRide.pickup_lng
                        } : null}
                        offeredPickups={activeOffers.map(o => ({
                            id: o.id,
                            lat: o.ride.pickup_lat,
                            lng: o.ride.pickup_lng
                        }))}
                        drop={activeRide ? {
                            lat: activeRide.dropoff_lat,
                            lng: activeRide.dropoff_lng
                        } : null}
                        status={activeRide ? activeRide.status : "IDLE"}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * DriverDashboard feature component wrapped with DriverProvider.
 */
const DriverDashboard = () => {
    return (
        <DriverProvider>
            <DriverDashboardInternal />
        </DriverProvider>
    );
};

export default DriverDashboard;
