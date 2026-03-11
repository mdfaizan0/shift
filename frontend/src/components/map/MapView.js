"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { configureLeafletIcons } from "@/lib/leaflet";
import { MAP_CONFIG } from "@/features/map/map.constants";
import { useTheme } from "next-themes";
import L from "leaflet";

// Configure icons on initialization
configureLeafletIcons();

// ──────────────────────────────────────────────
// STORAGE KEY for persisting map state
// ──────────────────────────────────────────────
const MAP_STORAGE_KEY = "shift_map_state";

const saveMapState = (lat, lng, zoom) => {
    try {
        localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify({ lat, lng, zoom }));
    } catch (e) { /* silent */ }
};

const loadMapState = () => {
    try {
        const raw = localStorage.getItem(MAP_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { /* silent */ }
    return null;
};

// ──────────────────────────────────────────────
// ROUTING LAYER — renders route polyline only
// ──────────────────────────────────────────────
function RoutingLayer({ from, to, onRouteFound }) {
    const map = useMap();
    const controlRef = useRef(null);

    useEffect(() => {
        if (!from || !to || !map) return;

        // Remove previous control
        if (controlRef.current) {
            try { map.removeControl(controlRef.current); } catch (e) { /* silent */ }
            controlRef.current = null;
        }

        const control = L.Routing.control({
            waypoints: [
                L.latLng(from.lat, from.lng),
                L.latLng(to.lat, to.lng),
            ],
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: false,
            createMarker: () => null, // Don't create waypoint markers
            lineOptions: {
                styles: [
                    { color: "#ffffff", opacity: 0.9, weight: 12 },
                    { color: "#4285F4", opacity: 1, weight: 6 },
                ],
                extendToWaypoints: false,
                missingRouteTolerance: 0,
            },
        });

        control.on("routesfound", (e) => {
            const route = e.routes[0];
            if (route && onRouteFound) {
                onRouteFound({
                    distance: route.summary.totalDistance / 1000, // km
                    eta: Math.round(route.summary.totalTime / 60), // minutes
                });
            }
        });

        control.addTo(map);
        controlRef.current = control;

        // Hide the routing container that leaflet-routing-machine creates
        const container = document.querySelector(".leaflet-routing-container");
        if (container) container.style.display = "none";

        return () => {
            if (controlRef.current) {
                try { map.removeControl(controlRef.current); } catch (e) { /* silent */ }
                controlRef.current = null;
            }
        };
    }, [from?.lat, from?.lng, to?.lat, to?.lng, map]);

    return null;
}

// ──────────────────────────────────────────────
// FOLLOW MODE — auto-pan map to follow a position
// ──────────────────────────────────────────────
function FollowMode({ position, enabled, onDisable }) {
    const map = useMap();

    // Disable follow on user drag
    useEffect(() => {
        if (!map || !onDisable) return;
        const handleDrag = () => onDisable();
        map.on("dragstart", handleDrag);
        return () => map.off("dragstart", handleDrag);
    }, [map, onDisable]);

    // Pan to position when enabled
    useEffect(() => {
        if (enabled && position && map) {
            map.panTo([position.lat, position.lng], { animate: true, duration: 1 });
        }
    }, [enabled, position?.lat, position?.lng, map]);

    return null;
}

// ──────────────────────────────────────────────
// MAP STATE PERSISTER — saves lat/lng/zoom on moveend
// ──────────────────────────────────────────────
function MapStatePersister() {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        const handleMove = () => {
            const center = map.getCenter();
            saveMapState(center.lat, center.lng, map.getZoom());
        };
        map.on("moveend", handleMove);
        return () => map.off("moveend", handleMove);
    }, [map]);
    return null;
}

// ──────────────────────────────────────────────
// MAP REF EXPOSER — provides map instance to parent
// ──────────────────────────────────────────────
function MapRefExposer({ onMapReady }) {
    const map = useMap();
    useEffect(() => {
        if (map && onMapReady) onMapReady(map);
    }, [map]);
    return null;
}

// ──────────────────────────────────────────────
// CUSTOM MARKER ICONS
// ──────────────────────────────────────────────
const getMarkerIcon = (type, metadata) => {
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
        const bearing = metadata?.bearing || 0;
        return L.divIcon({
            className: "driver-marker-icon",
            html: `
                <div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: rotate(${bearing - 90}deg); transition: transform 1s ease-out; transform-origin: center;">
                    <svg width="40" height="30" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="30" width="140" height="60" rx="20" fill="#fe7f01"/>
                        <path d="m105 25 10 5m-10 65 10-5" stroke="#000" stroke-width="5" stroke-linecap="round"/>
                        <path d="M35 40h7c3 0 6 3 6 8v24c0 5-3 8-6 8h-7c-5 0-7-5-7-8V48c0-5 2-8 7-8Zm50 0h30q15 0 15 15v10q0 15-15 15H85q-15 0-15-15V55q0-15 15-15Z" stroke="#000" stroke-width="6"/>
                    </svg>
                </div>
            `,
            iconSize: [40, 30],
            iconAnchor: [20, 15],
        });
    }
    return new L.Icon.Default();
};

// ──────────────────────────────────────────────
// MAIN MAP VIEW COMPONENT
// ──────────────────────────────────────────────
const MapView = ({
    center: propCenter,
    zoom: propZoom,
    markers = [],
    className = "h-full w-full",
    routeFrom,
    routeTo,
    onRouteFound,
    followPosition,
    followEnabled = false,
    onFollowDisable,
    onMapReady,
    centerTarget,
    children
}) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [initialCenter, setInitialCenter] = useState(null);
    const [initialZoom, setInitialZoom] = useState(null);
    const mapRef = useRef(null);

    // Determine initial center via cascade: geolocation → localStorage → env → prop
    useEffect(() => {
        setMounted(true);

        // 1. Try geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setInitialCenter([pos.coords.latitude, pos.coords.longitude]);
                    setInitialZoom(propZoom || MAP_CONFIG.DEFAULT_ZOOM);
                },
                () => {
                    // 2. Fallback to localStorage
                    const saved = loadMapState();
                    if (saved) {
                        setInitialCenter([saved.lat, saved.lng]);
                        setInitialZoom(saved.zoom || propZoom || MAP_CONFIG.DEFAULT_ZOOM);
                    } else {
                        // 3. Fallback to env/prop
                        setInitialCenter(propCenter || MAP_CONFIG.DEFAULT_CENTER);
                        setInitialZoom(propZoom || MAP_CONFIG.DEFAULT_ZOOM);
                    }
                },
                { timeout: 3000, maximumAge: 60000 }
            );
        } else {
            const saved = loadMapState();
            if (saved) {
                setInitialCenter([saved.lat, saved.lng]);
                setInitialZoom(saved.zoom || propZoom || MAP_CONFIG.DEFAULT_ZOOM);
            } else {
                setInitialCenter(propCenter || MAP_CONFIG.DEFAULT_CENTER);
                setInitialZoom(propZoom || MAP_CONFIG.DEFAULT_ZOOM);
            }
        }
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    // Center button handler
    const handleCenterClick = useCallback(() => {
        if (!mapRef.current) return;
        if (centerTarget) {
            mapRef.current.flyTo([centerTarget.lat, centerTarget.lng], mapRef.current.getZoom(), { duration: 0.8 });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], mapRef.current.getZoom(), { duration: 0.8 });
                },
                () => { /* silent */ },
                { timeout: 3000 }
            );
        }
    }, [centerTarget]);

    if (!initialCenter || !mounted) return null;

    return (
        <div className="relative w-full h-full">
            <div
                className={className}
                style={isDark ? { filter: "invert(90%) hue-rotate(160deg)" } : undefined}
            >
                <MapContainer
                    center={initialCenter}
                    zoom={initialZoom}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution={MAP_CONFIG.ATTRIBUTION}
                        url={MAP_CONFIG.TILE_URL}
                    />

                    <MapStatePersister />
                    <MapRefExposer onMapReady={(map) => {
                        mapRef.current = map;
                        if (onMapReady) onMapReady(map);
                    }} />

                    {/* Route polyline */}
                    {routeFrom && routeTo && (
                        <RoutingLayer from={routeFrom} to={routeTo} onRouteFound={onRouteFound} />
                    )}

                    {/* Follow driver mode */}
                    <FollowMode
                        position={followPosition}
                        enabled={followEnabled}
                        onDisable={onFollowDisable}
                    />

                    {/* Markers */}
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            position={[marker.lat, marker.lng]}
                            icon={getMarkerIcon(marker.type, marker.metadata)}
                        />
                    ))}

                    {children}
                </MapContainer>
            </div>

            {/* Center Button — floating bottom-right */}
            <button
                onClick={handleCenterClick}
                className="absolute bottom-4 right-4 z-1000 h-9 w-9 bg-card border border-border/50 rounded-full shadow-md flex items-center justify-center hover:bg-secondary/50 transition-colors active:scale-95 cursor-pointer"
                title="Center map"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-foreground">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4" />
                    <path d="M12 18v4" />
                    <path d="M2 12h4" />
                    <path d="M18 12h4" />
                </svg>
            </button>
        </div>
    );
};

export default MapView;
