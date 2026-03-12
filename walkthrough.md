# Phase 17 — Map Intelligence Layer

Build verified: ✅ Compiled successfully, 0 errors.

## Changes Made

### 1. New Dependency
- Installed `leaflet-routing-machine` for route polyline rendering via free OSRM backend.

### 2. [leaflet.js](file:///d:/labmentix/shift/frontend/src/lib/leaflet.js)
- Added `leaflet-routing-machine` and its CSS import.

### 3. [map.utils.js](file:///d:/labmentix/shift/frontend/src/utils/map.utils.js)
- Added [haversineDistance()](file:///d:/labmentix/shift/frontend/src/utils/map.utils.js#39-56) for straight-line distance fallback.
- Added [estimateETA()](file:///d:/labmentix/shift/frontend/src/utils/map.utils.js#57-67) for ETA calculation (default 30 km/h city speed).

### 4. [MapView.js](file:///d:/labmentix/shift/frontend/src/components/map/MapView.js) — Full Rewrite
- **Init Cascade**: Browser geolocation → `localStorage` (`shift_map_state`) → env vars.
- **State Persistence**: Saves `{ lat, lng, zoom }` to `localStorage` on every `moveend`.
- **RoutingLayer**: Inner component using `L.Routing.control` with `show:false`, orange-styled polyline, extraction of distance/ETA from routing result via `onRouteFound` callback.
- **FollowMode**: Auto-pans map to follow driver position. Disables on user drag.
- **Center Button**: Floating bottom-right crosshair button, uses `flyTo()` to center on driver (active ride) or user geolocation.
- **Marker Icons**: Refined driver SVG car icon using `--primary` CSS token.

### 5. [MapContainer.js](file:///d:/labmentix/shift/frontend/src/features/map/MapContainer.js) & Driver Connectivity
- **Route State Logic**: `ACCEPTED`/`DRIVER_EN_ROUTE` routes driver→pickup, while `STARTED` routes pickup→drop. Distance and ETA are extracted directly from the routing result, with a haversine fallback exposed via `onRouteInfo`.
- **Smooth Driver Animation & Direction**: Replaced GSAP with native `requestAnimationFrame` and a cubic ease-out interpolation. The driver marker now uniquely calculates its bearing from its movement vector and rotates to face its direction of travel dynamically.
- **Follow Mode**: Auto-enabled when a ride activates; disabled seamlessly on map drag.
- **Driver-Side Navigation Fix**: Upgraded [useDriverLocation](file:///d:/labmentix/shift/frontend/src/hooks/useDriverLocation.js#4-75) hook to expose the driver's live coordinates, and passed them locally into [MapContainer](file:///d:/labmentix/shift/frontend/src/features/map/MapContainer.js#30-232) as `initialDriverLocation`. Fixed a bug where missing sub-credentials caused the driver's own map to strip their location, immediately restoring route visualization and center-button tracking for Captains.
- **Live ETA & Distance UI**: Wired the `onRouteInfo` payload from [MapContainer](file:///d:/labmentix/shift/frontend/src/features/map/MapContainer.js#30-232) into both [RideStatusCard.js](file:///d:/labmentix/shift/frontend/src/features/rider/RideStatusCard.js) and [ActiveRideCard.js](file:///d:/labmentix/shift/frontend/src/features/driver/ActiveRideCard.js). Both riders and drivers now see a sleek, high-contrast typography readout of live ETA (MIN) and Distance (KM) matching the "Sophisticated Clean" aesthetic.

### 6. GSAP Removal
- GSAP (`gsap`) is no longer imported or used anywhere in the map system. The native `requestAnimationFrame` approach is lighter and works correctly.
