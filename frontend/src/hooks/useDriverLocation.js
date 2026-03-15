import { useEffect, useRef, useState } from "react";
import { driverService } from "@/services/driver.service";

/**
 * Custom hook to track driver location and send periodic updates to the backend.
 * @param {boolean} isOnline - Whether the driver is currently online.
 */
export const useDriverLocation = (isOnline) => {
    const watchId = useRef(null);
    const lastUpdateRef = useRef(0);
    const [currentLocation, setCurrentLocation] = useState(null);
    const UPDATE_INTERVAL = 5000;

    const sendUpdate = async (position, isManual = false) => {
        const now = Date.now();
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        if (isManual || now - lastUpdateRef.current >= UPDATE_INTERVAL || lastUpdateRef.current === 0) {
            try {
                await driverService.locationUpdate({
                    lat: latitude,
                    lng: longitude
                });
                lastUpdateRef.current = now;
            } catch (error) {
                console.error("Failed to update driver location:", error);
            }
        }
    };

    const refreshLocation = () => {
        if (!isOnline) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => sendUpdate(pos, true),
            (err) => console.error("Manual geolocation refresh error:", err),
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        if (!isOnline) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        const handleError = (error) => {
            console.error("Geolocation error:", error);
        };

        // Watch position for continuous tracking, but sendUpdate throttles the actual API calls
        watchId.current = navigator.geolocation.watchPosition(
            (pos) => sendUpdate(pos),
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [isOnline]);

    return { refreshLocation, currentLocation };
};
