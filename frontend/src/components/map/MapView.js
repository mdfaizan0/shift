"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { configureLeafletIcons } from "@/lib/leaflet";
import { MAP_CONFIG } from "@/features/map/map.constants";
import { useTheme } from "next-themes";

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
 * Reusable MapView component.
 * Must be loaded with ssr: false.
 */
const MapView = ({
    center = MAP_CONFIG.DEFAULT_CENTER,
    zoom = MAP_CONFIG.DEFAULT_ZOOM,
    markers = [],
    className = "h-full w-full"
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
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
