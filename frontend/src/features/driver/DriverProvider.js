"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { driverService } from "@/services/driver.service";
import { useAuthUser } from "@/hooks/useAuthUser";
import { realtimeService } from "@/lib/realtime";
import { rideService } from "@/services/ride.service";

const DriverContext = createContext(undefined);

/**
 * Provider to manage driver-specific state and actions.
 * Distinguishes between isOnline (app active) and isAvailable (ready for rides).
 */
export const DriverProvider = ({ children }) => {
    const { role } = useAuthUser();
    const [isOnline, setIsOnline] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [driverProfile, setDriverProfile] = useState(null);
    const [activeRide, setActiveRide] = useState(null);

    // Status tracking refs
    const statusRef = useRef("INITIALIZING");
    const mountedRef = useRef(false);

    const fetchDriverStats = useCallback(async () => {
        if (role !== "DRIVER") return;

        setIsLoading(true);
        try {
            // 1. Fetch Profile
            const data = await driverService.getProfile();
            if (data.success) {
                setDriverProfile(data.driver);
                setIsOnline(data.driver.is_online);
                setIsAvailable(data.driver.is_available);
                statusRef.current = data.driver.is_online ? "ONLINE" : "OFFLINE";

                // 2. Fetch Active Ride via API to ensure persistence
                const rideData = await rideService.getActiveRide("driver");
                if (rideData.success && rideData.ride) {
                    setActiveRide(rideData.ride);
                } else {
                    setActiveRide(null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch driver profile:", error);
        } finally {
            setIsLoading(false);
        }
    }, [role]);

    const goOnline = useCallback(async () => {
        try {
            const data = await driverService.goOnline();
            if (data.success) {
                setIsOnline(true);
                setDriverProfile(prev => prev ? { ...prev, is_online: true } : null);
                statusRef.current = "ONLINE";
                return true;
            }
        } catch (error) {
            console.error("Failed to go online:", error);
        }
        return false;
    }, []);

    const goOffline = useCallback(async () => {
        // Optimization: if we're calling this during a teardown/logout flow, 
        // we might not want to set loading state in react if unmounting.
        // But for consistency we keep it.
        setIsLoading(true);
        try {
            const data = await driverService.goOffline();
            if (data.success) {
                setIsOnline(false);
                setIsAvailable(false);
                setDriverProfile(data.driver);
                statusRef.current = "OFFLINE";
                return true;
            }
        } catch (error) {
            console.error("Failed to go offline:", error);
        } finally {
            setIsLoading(false);
        }
        return false;
    }, []);

    const toggleAvailability = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await driverService.toggleAvailability();
            if (data.success) {
                setIsAvailable(data.is_available);
                setDriverProfile(prev => prev ? { ...prev, is_available: data.is_available } : null);
                return true;
            }
        } catch (error) {
            console.error("Failed to toggle availability:", error);
        } finally {
            setIsLoading(false);
        }
        return false;
    }, []);

    // Simplified Initialization Logic
    useEffect(() => {
        if (role !== "DRIVER" || mountedRef.current) return;
        mountedRef.current = true;

        const initAndTrackStatus = async () => {
            setIsLoading(true);
            try {
                // 1. Initial Profile Fetch
                const data = await driverService.getProfile();
                if (data.success) {
                    setDriverProfile(data.driver);
                    setIsOnline(data.driver.is_online);
                    setIsAvailable(data.driver.is_available);

                    const dbOnline = data.driver.is_online;
                    statusRef.current = dbOnline ? "ONLINE" : "OFFLINE";

                    // 2. Auto-Online if visible but DB says offline
                    if (!dbOnline) {
                        try {
                            await driverService.goOnline();
                            setIsOnline(true);
                            statusRef.current = "ONLINE";
                        } catch (e) {
                            console.error("Auto-online failed:", e);
                        }
                    }

                    // 3. Fetch Active Ride for persistence via API
                    const rideData = await rideService.getActiveRide("driver");
                    if (rideData.success && rideData.ride) {
                        setActiveRide(rideData.ride);
                    }
                }
            } catch (error) {
                console.error("Driver initialization failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initAndTrackStatus();

        // No more browser event listeners or unmount cleanups for offline
        return () => {
            mountedRef.current = false;
        };
    }, [role, goOnline]);

    // 3. Realtime Ride Updates (Moved to top level to avoid invalid hook call)
    useEffect(() => {
        if (role !== "DRIVER" || !driverProfile?.id) return;

        const channel = realtimeService.subscribeToRideUpdates(driverProfile.id, "driver_id", (updatedRide) => {
            fetchDriverStats();
        });

        return () => {
            realtimeService.unsubscribe(channel);
        };
    }, [role, driverProfile?.id, fetchDriverStats]);

    const value = {
        isOnline,
        isAvailable,
        isLoading,
        driverProfile,
        activeRide,
        setActiveRide,
        goOnline,
        goOffline,
        toggleAvailability,
        refreshStats: fetchDriverStats
    };

    return (
        <DriverContext.Provider value={value}>
            {children}
        </DriverContext.Provider>
    );
};

export default DriverProvider;

/**
 * Hook to use the DriverContext.
 */
export const useDriver = () => {
    const context = useContext(DriverContext);
    if (context === undefined) {
        throw new Error("useDriver must be used within a DriverProvider");
    }
    return context;
};
