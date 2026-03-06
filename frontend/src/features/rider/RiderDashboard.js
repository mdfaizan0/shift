"use client";

import React from "react";
import MapContainer from "@/features/map/MapContainer";
import RideBookingCard from "./RideBookingCard";
import RideStatusCard from "./RideStatusCard";

const RiderDashboard = () => {
    const [pickup, setPickup] = React.useState(null);
    const [drop, setDrop] = React.useState(null);

    const handleLocationSelect = (type, coords) => {
        if (type === "pickup") setPickup(coords);
        if (type === "drop") setDrop(coords);
        if (type === "reset") {
            setPickup(null);
            setDrop(null);
        }
    };

    return (
        <div className="relative flex flex-col md:flex-row gap-6 min-h-[calc(100vh-10rem)]">
            {/* Sidebar / Controls Overlay */}
            <div className="w-full md:w-[400px] flex flex-col gap-6 z-10">
                <section>
                    <RideBookingCard pickup={pickup} drop={drop} />
                </section>

                <section>
                    <RideStatusCard status="IDLE" />
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
                        pickup={pickup}
                        drop={drop}
                    />
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
