"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapEvents } from "react-leaflet";
import { createMarker } from "@/utils/map.utils";

/**
 * Internal component to handle map click events.
 * Must be rendered inside MapView (which wraps react-leaflet's MapContainer).
 */
function MapClickHandler({ onClick }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng);
        },
    });
    return null;
}

/**
 * Dynamic import of MapView with SSR disabled.
 */
const MapView = dynamic(() => import("@/components/map/MapView"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-xl" />,
});

/**
 * MapContainer feature component that wraps MapView and handles interaction.
 */
const MapContainer = ({ onLocationSelect, pickup, drop, ...props }) => {
    const handleMapClick = (latlng) => {
        if (!pickup) {
            // Step 1: Set pickup
            onLocationSelect("pickup", { lat: latlng.lat, lng: latlng.lng });
        } else if (!drop) {
            // Step 2: Set drop
            onLocationSelect("drop", { lat: latlng.lat, lng: latlng.lng });
        } else {
            // Step 3: Reset and set new pickup
            onLocationSelect("reset", null);
            onLocationSelect("pickup", { lat: latlng.lat, lng: latlng.lng });
        }
    };

    // Construct markers from coordinates
    const markers = [];
    if (pickup) markers.push(createMarker(pickup.lat, pickup.lng, "pickup"));
    if (drop) markers.push(createMarker(drop.lat, drop.lng, "drop"));

    return (
        <div className="relative w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden border shadow-sm">
            <MapView markers={markers} {...props}>
                <MapClickHandler onClick={handleMapClick} />
            </MapView>
        </div>
    );
};

export default MapContainer;
