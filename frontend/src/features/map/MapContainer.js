"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dynamic import of MapView with SSR disabled.
 */
const MapView = dynamic(() => import("@/components/map/MapView"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-xl" />,
});

/**
 * MapContainer feature component that wraps MapView.
 */
const MapContainer = (props) => {
    return (
        <div className="relative w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden border shadow-sm">
            <MapView {...props} />
        </div>
    );
};

export default MapContainer;
