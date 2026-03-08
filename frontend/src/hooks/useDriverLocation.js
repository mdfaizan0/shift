import { useEffect, useRef } from "react";
import { driverService } from "@/services/driver.service";

/**
 * Custom hook to track driver location and send periodic updates to the backend.
 * @param {boolean} isOnline - Whether the driver is currently online.
 */
export const useDriverLocation = (isOnline) => {
    const watchId = useRef(null);
    const lastUpdateRef = useRef(0);
    const UPDATE_INTERVAL = 10000; // 10 seconds

    useEffect(() => {
        if (!isOnline) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        const sendUpdate = async (position) => {
            const now = Date.now();
            // Immediate update if it's the first one, or throttle by 10s
            if (now - lastUpdateRef.current >= UPDATE_INTERVAL || lastUpdateRef.current === 0) {
                try {
                    const { latitude, longitude } = position.coords;
                    await driverService.locationUpdate({
                        lat: latitude,
                        lng: longitude
                    });
                    lastUpdateRef.current = now;
                    console.log("Location update sent:", { latitude, longitude });
                } catch (error) {
                    console.error("Failed to update driver location:", error);
                }
            }
        };

        const handleError = (error) => {
            console.error("Geolocation error:", error);
        };

        // Watch position for continuous tracking, but sendUpdate throttles the actual API calls
        watchId.current = navigator.geolocation.watchPosition(
            sendUpdate,
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
};
