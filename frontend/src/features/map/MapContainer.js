"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapEvents } from "react-leaflet";
import { createMarker } from "@/utils/map.utils";
import gsap from "gsap";
import { realtimeService } from "@/lib/realtime";

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
const MapContainer = ({ onLocationSelect, pickup, drop, driverId, status = "IDLE", ...props }) => {
    const [smoothDriverLoc, setSmoothDriverLoc] = React.useState(null);

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

    // Handle Real-time Driver Location Subscription
    React.useEffect(() => {
        if (!driverId || !["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status)) {
            setSmoothDriverLoc(null);
            return;
        }

        const channel = realtimeService.subscribeToDriverLocation(driverId, (payload) => {
            if (payload.location) {
                const loc = parsePoint(payload.location);
                if (loc) {
                    // Start smooth transition
                    const obj = { lat: smoothDriverLoc?.lat || loc.lat, lng: smoothDriverLoc?.lng || loc.lng };
                    gsap.to(obj, {
                        lat: loc.lat,
                        lng: loc.lng,
                        duration: 1.5,
                        ease: "power2.out",
                        onUpdate: () => {
                            setSmoothDriverLoc({ lat: obj.lat, lng: obj.lng });
                        }
                    });
                }
            }
        });

        return () => {
            realtimeService.unsubscribe(channel);
        };
    }, [driverId, status]);

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
