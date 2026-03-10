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
const MapContainer = ({ onLocationSelect, pickup, drop, driverId, initialDriverLocation, offeredPickups = [], status = "IDLE", ...props }) => {
    console.log("MapContainer Render. driverId:", driverId, "status:", status, "initialLoc:", initialDriverLocation);
    const [smoothDriverLoc, setSmoothDriverLoc] = React.useState(initialDriverLocation || null);

    // Update smooth location if initial location is provided (e.g. after fetch)
    React.useEffect(() => {
        if (initialDriverLocation && !smoothDriverLoc) {
            setSmoothDriverLoc(initialDriverLocation);
        }
    }, [initialDriverLocation]);

    // Parse PostGIS location (supports both WKT string and WKB HEX)
    const parsePoint = (point) => {
        if (!point) return null;

        // Case 1: WKT String (e.g. "POINT(lng lat)" or "SRID=4326;POINT(lng lat)")
        if (typeof point === 'string' && point.includes('POINT')) {
            try {
                const match = point.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
                if (match) {
                    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
                }
            } catch (e) {
                console.error("Failed to parse WKT point:", point);
            }
        }

        // Case 2: WKB HEX (e.g. "0101000020E6100000...")
        // Standard PostGIS EWKB for Point(4326): 
        // 01 (Little Endian) + 01000020 (Type) + E6100000 (SRID 4326) + Lng (8 bytes) + Lat (8 bytes)
        if (typeof point === 'string' && /^[0-9A-F]+$/i.test(point) && point.length >= 50) {
            try {
                // Convert HEX to ArrayBuffer
                const buffer = new Uint8Array(point.match(/.{1,2}/g).map(byte => parseInt(byte, 16))).buffer;
                const view = new DataView(buffer);
                const isLittleEndian = view.getUint8(0) === 1;

                // Offset 21: Lng starts (8 bytes for double)
                // Offset 29: Lat starts (8 bytes for double)
                // Note: Standard WKB is 1 + 4 + 8 + 8 = 21 bytes. 
                // EWKB (with SRID) is 1 + 4 + 4 + 8 + 8 = 25 bytes.
                // Your hex is 50 chars = 25 bytes.
                const lng = view.getFloat64(9, isLittleEndian);
                const lat = view.getFloat64(17, isLittleEndian);

                return { lat, lng };
            } catch (e) {
                console.error("Failed to parse WKB HEX point:", e);
            }
        }

        return null;
    };

    // Handle Real-time Driver Location Subscription
    React.useEffect(() => {
        console.log("Location tracking effect. driverId:", driverId, "status:", status);
        if (!driverId || !["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status)) {
            console.log("Location tracking skipped (guard condition triggered)");
            setSmoothDriverLoc(null);
            return;
        }

        const channel = realtimeService.subscribeToDriverLocation(driverId, (payload) => {
            console.log("Driver location update received!", payload);
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
        markers.push(createMarker(smoothDriverLoc.lat, smoothDriverLoc.lng, "driver_marker", "driver"));
    }

    // Task 5: Offered Pickups (pulsing markers)
    if (offeredPickups && offeredPickups.length > 0 && status === "IDLE") {
        offeredPickups.forEach(off => {
            markers.push(createMarker(off.lat, off.lng, off.id, "pickup_offer"));
        });
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
