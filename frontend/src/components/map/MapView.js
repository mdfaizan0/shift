"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { configureLeafletIcons } from "@/lib/leaflet";
import { MAP_CONFIG } from "@/features/map/map.constants";
import { useTheme } from "next-themes";
import L from "leaflet";

// Configure icons on initialization
configureLeafletIcons();

/**
 * Component to handle map center updates dynamically.
 */
function MapAutoCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

/**
 * Get custom icon based on marker type.
 */
const getMarkerIcon = (type) => {
    if (type === "pickup_offer") {
        return L.divIcon({
            className: "custom-div-icon",
            html: `
                <div class="marker-pulse-container">
                    <div class="marker-pulse-ring"></div>
                    <div class="marker-pulse-dot"></div>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });
    }
    if (type === "driver") {
        return L.divIcon({
            className: "driver-marker-icon",
            html: `
                <div class="driver-marker-container">
                    <div class="driver-marker-car bg-primary shadow-lg border-2 border-white">
                        <svg viewBox="0 0 24 24" fill="white" class="w-5 h-5">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 15 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                        </svg>
                    </div>
                    <div class="driver-marker-arrow"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
    }
    return new L.Icon.Default();
};

/**
 * Reusable MapView component.
 * Must be loaded with ssr: false.
 */
const MapView = ({
    center = MAP_CONFIG.DEFAULT_CENTER,
    zoom = MAP_CONFIG.DEFAULT_ZOOM,
    markers = [],
    className = "h-full w-full",
    children
}) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <div
            className={className}
            style={isDark ? { filter: "invert(90%) hue-rotate(160deg)" } : undefined}
        >
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution={MAP_CONFIG.ATTRIBUTION}
                    url={MAP_CONFIG.TILE_URL}
                />

                <MapAutoCenter center={center} />

                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={[marker.lat, marker.lng]}
                        icon={getMarkerIcon(marker.type)}
                    />
                ))}

                {children}
            </MapContainer>
        </div>
    );
};

export default MapView;
