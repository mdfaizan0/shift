"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapEvents } from "react-leaflet";
import { createMarker } from "@/utils/map.utils";
import gsap from "gsap";

/**
 * Internal component to handle map click events.
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
const MapContainer = ({ onLocationSelect, pickup, drop, driverLocation, status = "IDLE", ...props }) => {
    const driverMarkerRef = React.useRef(null);
    const [smoothDriverLoc, setSmoothDriverLoc] = React.useState(driverLocation);

    // Smoothly interpolate driver location using GSAP
    React.useEffect(() => {
        if (!driverLocation) {
            setSmoothDriverLoc(null);
            return;
        }

        if (!smoothDriverLoc) {
            setSmoothDriverLoc(driverLocation);
            return;
        }

        const obj = { lat: smoothDriverLoc.lat, lng: smoothDriverLoc.lng };
        gsap.to(obj, {
            lat: driverLocation.lat,
            lng: driverLocation.lng,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
                setSmoothDriverLoc({ lat: obj.lat, lng: obj.lng });
            }
        });
    }, [driverLocation]);

    const handleMapClick = (latlng) => {
        if (!onLocationSelect || status !== "IDLE") return;

        if (!pickup) {
            onLocationSelect("pickup", { lat: latlng.lat, lng: latlng.lng });
        } else if (!drop) {
            onLocationSelect("drop", { lat: latlng.lat, lng: latlng.lng });
        } else {
            onLocationSelect("reset", null);
            onLocationSelect("pickup", { lat: latlng.lat, lng: latlng.lng });
        }
    };

    // Construct markers from coordinates based on status
    const markers = [];

    // Pickup is always shown if it exists
    if (pickup) markers.push(createMarker(pickup.lat, pickup.lng, "pickup"));

    // Dropoff only shown during booking or when ride is active (ACCEPTED onwards)
    if (drop && (status === "IDLE" || ["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status))) {
        markers.push(createMarker(drop.lat, drop.lng, "drop"));
    }

    // Driver Marker shown when ride is accepted but not yet completed
    if (smoothDriverLoc && ["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status)) {
        markers.push(createMarker(smoothDriverLoc.lat, smoothDriverLoc.lng, "driver"));
    }

    return (
        <div className="relative w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden border shadow-sm">
            <MapView markers={markers} {...props}>
                <MapClickHandler onClick={handleMapClick} />
            </MapView>
        </div>
    );
};

export default MapContainer;
