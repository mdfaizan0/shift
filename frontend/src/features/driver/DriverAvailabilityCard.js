"use client";

import React from "react";
import { useDriver } from "./DriverProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Power, PowerOff, ShieldCheck, Car, Radio, InfoIcon } from "lucide-react";

/**
 * Card for drivers to toggle their ride availability.
 * Online status (app active) is handled automatically.
 */
const DriverAvailabilityCard = () => {
    const { isOnline, isAvailable, isLoading, toggleAvailability } = useDriver();

    function getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        if (hour < 22) return "Good Evening";
        return "It's late night";
    }

    return (
        <Card className="w-full shadow-2xl border-primary/10 overflow-hidden bg-card">
            <div className={`h-2 w-full transition-colors duration-700 ${isAvailable ? "bg-green-500" : isOnline ? "bg-orange-500" : "bg-destructive"}`} />
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary" />
                            Shift Captain
                        </CardTitle>
                        <CardDescription>Manage your ride status</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "bg-blue-500" : ""}>
                            {isOnline ? "Online" : "Offline"}
                        </Badge>
                        {isOnline && (
                            <Badge variant={isAvailable ? "default" : "outline"} className={isAvailable ? "bg-green-500 hover:bg-green-600" : ""}>
                                {isAvailable ? "Available for Rides" : "Just Chilling"}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-secondary/50 dark:bg-muted/30 border border-border flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <InfoIcon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                        {isAvailable
                            ? `${getTimeOfDay()}! You are ready to take rides.`
                            : isOnline
                                ? "You are online but not taking rides. Toggle 'Go Online' to start!"
                                : "Connecting to Shift network..."
                        }
                    </p>
                </div>

                <Button
                    className={`w-full h-14 text-lg font-bold gap-3 transition-all duration-300 ${isAvailable ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                        }`}
                    onClick={() => toggleAvailability()}
                    disabled={isLoading || !isOnline}
                >
                    {isLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isAvailable ? (
                        <>
                            <PowerOff className="h-5 w-5" />
                            Go Offline (Stop Rides)
                        </>
                    ) : (
                        <>
                            <Radio className="h-5 w-5 animate-pulse" />
                            Go Online (Start Rides)
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default DriverAvailabilityCard;
