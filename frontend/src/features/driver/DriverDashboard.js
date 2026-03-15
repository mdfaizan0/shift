"use client";

import React from "react";
import MapContainer from "@/features/map/MapContainer";
import DriverAvailabilityCard from "./DriverAvailabilityCard";
import { DriverProvider, useDriver } from "./DriverProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Star, Radio } from "lucide-react";
import DispatchListener from "./dispatch/DispatchListener";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import ActiveRideCard from "./ActiveRideCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Inner dashboard component that consumes DriverProvider.
 */
const DriverDashboardInternal = () => {
    const { isOnline, isAvailable, activeRide, isLoading: isDriverLoading } = useDriver();
    const { user, isLoading: isAuthLoading } = useAuthUser();
    const router = useRouter();
    const [activeOffers, setActiveOffers] = React.useState([]);
    const [routeInfo, setRouteInfo] = React.useState(null);

    const isLoading = isDriverLoading || isAuthLoading;

    // Track and broadcast location while online
    const { refreshLocation, currentLocation } = useDriverLocation(isOnline);

    if (isLoading) {
        return (
            <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-6 py-8">
                <div className="w-full md:w-[400px] space-y-6">
                    <Skeleton className="h-[200px] w-full rounded-2xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-[100px] w-full rounded-xl" />
                        <Skeleton className="h-[100px] w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-[120px] w-full rounded-xl" />
                </div>
                <div className="flex-1">
                    <Skeleton className="h-[600px] w-full rounded-3xl" />
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
            <motion.div
                className="w-full md:w-[400px] flex flex-col gap-6 z-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <section className="relative group">
                    {activeRide ? (
                        <ActiveRideCard ride={activeRide} routeInfo={routeInfo} />
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
                    <Card
                        className="bg-muted/30 border-none shadow-none cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push("/earnings")}
                    >
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <IndianRupee className="h-4 w-4 text-emerald-500 mb-2" />
                            <span className="text-xl font-black text-foreground">₹--</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Earnings</span>
                            <Button variant="link" className="h-4 p-0 text-[9px] font-bold text-primary mt-1 uppercase tracking-tight">View All</Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <Star className="h-4 w-4 text-orange-400 fill-orange-400 mb-2" />
                            <span className="text-xl font-black text-foreground">
                                {user?.driver_rating_count > 0 ? user.driver_avg_rating.toFixed(1) : "New"}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rating</span>
                            <span className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tight">
                                {user?.driver_rating_count || 0} Rides
                            </span>
                        </CardContent>
                    </Card>
                </div>


                <div className="hidden md:block bg-linear-to-t from-muted/50 to-transparent rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground italic">
                        &quot;Drive responsibly. Your safety and the rider's safety are paramount.&quot;
                    </p>
                </div>
            </motion.div>

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
                        initialDriverLocation={currentLocation}
                        onRouteInfo={setRouteInfo}
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
