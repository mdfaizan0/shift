"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapEvents } from "react-leaflet";
import { createMarker, haversineDistance, estimateETA, calculateBearing } from "@/utils/map.utils";
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
const MapContainer = ({ 
    onLocationSelect, 
    pickup, 
    drop, 
    driverId, 
    initialDriverLocation, 
    offeredPickups = [], 
    status = "IDLE", 
    onRouteInfo, 
    isPreview = false,
    ...props 
}) => {
    const [smoothDriverLoc, setSmoothDriverLoc] = React.useState(initialDriverLocation || null);
    const [followEnabled, setFollowEnabled] = React.useState(true);
    const [routeInfo, setRouteInfo] = React.useState(null);
    const [driverBearing, setDriverBearing] = React.useState(0);
    const driverAnimRef = React.useRef(null);

    // Sync smooth location with initialDriverLocation (used on driver side where
    // the driver's own geolocation is passed directly, not via realtime subscription)
    React.useEffect(() => {
        if (initialDriverLocation && !isPreview) {
            if (smoothDriverLoc && (smoothDriverLoc.lat !== initialDriverLocation.lat || smoothDriverLoc.lng !== initialDriverLocation.lng)) {
                setDriverBearing(calculateBearing(smoothDriverLoc.lat, smoothDriverLoc.lng, initialDriverLocation.lat, initialDriverLocation.lng));
            }
            setSmoothDriverLoc(initialDriverLocation);
        }
    }, [initialDriverLocation?.lat, initialDriverLocation?.lng, isPreview]);

    // Parse PostGIS location (supports both WKT string and WKB HEX)
    const parsePoint = (point) => {
        if (!point) return null;

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

        if (typeof point === 'string' && /^[0-9A-F]+$/i.test(point) && point.length >= 50) {
            try {
                const buffer = new Uint8Array(point.match(/.{1,2}/g).map(byte => parseInt(byte, 16))).buffer;
                const view = new DataView(buffer);
                const isLittleEndian = view.getUint8(0) === 1;
                const lng = view.getFloat64(9, isLittleEndian);
                const lat = view.getFloat64(17, isLittleEndian);
                return { lat, lng };
            } catch (e) {
                console.error("Failed to parse WKB HEX point:", e);
            }
        }

        return null;
    };

    // Handle Real-time Driver Location Subscription with smooth CSS transitions
    React.useEffect(() => {
        if (isPreview || !["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status)) {
            setSmoothDriverLoc(null);
            return;
        }

        if (!driverId) return; // Driver side: location is managed by initialDriverLocation

        const channel = realtimeService.subscribeToDriverLocation(driverId, (payload) => {
            if (payload.location) {
                const loc = parsePoint(payload.location);
                if (loc) {
                    // Use requestAnimationFrame-based smooth interpolation
                    const startLoc = (smoothDriverLoc && smoothDriverLoc.lat != null) ? { lat: smoothDriverLoc.lat, lng: smoothDriverLoc.lng } : { lat: loc.lat, lng: loc.lng };
                    
                    // Update bearing if the position actually changed
                    if (startLoc.lat !== loc.lat || startLoc.lng !== loc.lng) {
                        setDriverBearing(calculateBearing(startLoc.lat, startLoc.lng, loc.lat, loc.lng));
                    }

                    const startTime = performance.now();
                    const duration = 1500; // ms

                    // Cancel any previous animation
                    if (driverAnimRef.current) {
                        cancelAnimationFrame(driverAnimRef.current);
                    }

                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);

                        const lat = startLoc.lat + (loc.lat - startLoc.lat) * eased;
                        const lng = startLoc.lng + (loc.lng - startLoc.lng) * eased;

                        setSmoothDriverLoc({ lat, lng });

                        if (progress < 1) {
                            driverAnimRef.current = requestAnimationFrame(animate);
                        }
                    };

                    driverAnimRef.current = requestAnimationFrame(animate);
                }
            }
        });

        return () => {
            if (driverAnimRef.current) cancelAnimationFrame(driverAnimRef.current);
            realtimeService.unsubscribe(channel);
        };
    }, [driverId, status, isPreview]);

    // Re-enable follow mode when a new ride becomes active
    React.useEffect(() => {
        if (!isPreview && ["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status)) {
            setFollowEnabled(true);
        }
    }, [status, isPreview]);

    const handleMapClick = (latlng) => {
        if (isPreview || !onLocationSelect || status !== "IDLE") return;

        if (!pickup) {
            onLocationSelect("pickup", { lat: latlng.lat, lng: latlng.lng });
        } else if (!drop) {
            onLocationSelect("drop", { lat: latlng.lat, lng: latlng.lng });
        } else {
            onLocationSelect("reset", null);
            onLocationSelect("pickup", { lat: latlng.lat, lng: latlng.lng });
        }
    };

    // Route state logic
    const isLive = ["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status);
    let routeFrom = null;
    let routeTo = null;

    if (isPreview) {
        routeFrom = pickup;
        routeTo = drop;
    } else if (isLive && smoothDriverLoc && pickup) {
        if (status === "STARTED") {
            // During ride: pickup → drop
            routeFrom = pickup;
            routeTo = drop;
        } else {
            // Driver en route: driver → pickup
            routeFrom = smoothDriverLoc;
            routeTo = pickup;
        }
    }

    // Handle route info from routing machine
    const handleRouteFound = React.useCallback((info) => {
        setRouteInfo(info);
        if (onRouteInfo) onRouteInfo(info);
    }, [onRouteInfo]);

    // Fallback distance/ETA using haversine when no routing result yet
    React.useEffect(() => {
        if (routeInfo) return; // We have real data
        if (!routeFrom || !routeTo) return;

        const dist = haversineDistance(routeFrom.lat, routeFrom.lng, routeTo.lat, routeTo.lng);
        const eta = estimateETA(dist);
        const fallback = { distance: dist, eta, isFallback: true };
        if (onRouteInfo) onRouteInfo(fallback);
    }, [routeFrom?.lat, routeFrom?.lng, routeTo?.lat, routeTo?.lng, routeInfo]);

    // Construct markers
    const markers = [];

    if (pickup) markers.push(createMarker(pickup.lat, pickup.lng, "pickup"));

    if (drop && (status === "IDLE" || isLive || isPreview)) {
        markers.push(createMarker(drop.lat, drop.lng, "drop"));
    }

    if (!isPreview && smoothDriverLoc && isLive) {
        markers.push(createMarker(smoothDriverLoc.lat, smoothDriverLoc.lng, "driver_marker", "driver", { bearing: driverBearing }));
    }

    if (!isPreview && offeredPickups && offeredPickups.length > 0 && status === "IDLE") {
        offeredPickups.forEach(off => {
            markers.push(createMarker(off.lat, off.lng, off.id, "pickup_offer"));
        });
    }

    // Center target for the center button
    const centerTarget = isLive && smoothDriverLoc ? smoothDriverLoc : null;

    return (
        <div className={`relative w-full rounded-xl overflow-hidden border shadow-sm ${isPreview ? 'h-full' : 'h-[400px] md:h-[600px]'}`}>
            <MapView
                markers={markers.filter(m => m.lat != null && m.lng != null && !isNaN(m.lat) && !isNaN(m.lng))}
                routeFrom={routeFrom}
                routeTo={routeTo}
                onRouteFound={handleRouteFound}
                followPosition={isPreview ? null : smoothDriverLoc}
                followEnabled={!isPreview && isLive && followEnabled}
                onFollowDisable={() => setFollowEnabled(false)}
                centerTarget={isPreview ? null : centerTarget}
                fitMarkers={isPreview}
                isPreview={isPreview}
                {...props}
            >
                <MapClickHandler onClick={handleMapClick} />
            </MapView>
        </div>
    );
};

export default MapContainer;
