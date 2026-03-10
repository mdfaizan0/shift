"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, IndianRupee, Navigation, Phone, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { rideService } from "@/services/ride.service";
import { toast } from "sonner";
import { useDriver } from "./DriverProvider";

export default function ActiveRideCard({ ride }) {
    const { refreshStats, setActiveRide } = useDriver();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isEnRoute = ride.status === "DRIVER_EN_ROUTE";
    const isAccepted = ride.status === "ACCEPTED";
    const isStarted = ride.status === "STARTED";

    const handleStartRide = async () => {
        if (!otp || otp.length !== 4) {
            toast.error("Please enter a valid 4-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const res = await rideService.startRide(ride.id, otp);
            if (res.success) {
                toast.success("Ride started! Drive safely.");
                setActiveRide(res.ride);
                refreshStats();
            }
        } catch (error) {
            console.error("Failed to start ride:", error);
            // Error handled by interceptor (likely invalid OTP)
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnRoute = async () => {
        setIsLoading(true);
        try {
            const res = await rideService.enrouteRide(ride.id);
            if (res.success) {
                toast.success("Status updated: En route to pickup");
                setActiveRide(res.ride);
                refreshStats();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteRide = async () => {
        setIsLoading(true);
        try {
            const res = await rideService.completeRide(ride.id);
            if (res.success) {
                toast.success("Ride completed successfully!");
                setActiveRide(null);
                refreshStats();
            }
        } catch (error) {
            console.error("Failed to complete ride:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRide = async () => {
        if (!confirm("Are you sure you want to cancel this ride?")) return;

        setIsLoading(true);
        try {
            const res = await rideService.cancelRide(ride.id);
            if (res.success) {
                toast.info("Ride cancelled");
                setActiveRide(null);
                refreshStats();
            }
        } catch (error) {
            console.error("Failed to cancel ride:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPInput = (e) => {
        const val = e.target.value.replace(/\D/g, "");
        if (!val) {
            const newOtp = otp.split("");
            newOtp[index] = "";
            setOtp(newOtp.join(""));
            return;
        }
        const newOtp = otp.split("");
        newOtp[index] = val[val.length - 1];
        setOtp(newOtp.join(""));
        if (index < 3) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    }

    return (
        <Card className="w-full shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        Active Ride
                    </CardTitle>
                    <Badge variant={isStarted ? "default" : "secondary"}>
                        {ride.status.replace(/_/g, " ")}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <div className="flex-1 w-px bg-muted mx-auto my-1" />
                            <div className="h-2 w-2 rounded-full bg-destructive" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pickup</p>
                                <p className="text-sm font-semibold leading-tight">{ride.pickup_location}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Dropoff</p>
                                <p className="text-sm font-semibold leading-tight">{ride.dropoff_location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        <span className="font-bold">₹{ride.fare}</span>
                    </div>
                    {ride.rider && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>Contact Rider</span>
                        </div>
                    )}
                </div>

                {(isAccepted || isEnRoute) && (
                    <div className="space-y-3 pt-2">
                        <p className="text-xs font-medium text-center text-muted-foreground">
                            {isAccepted ? "Update status when you start moving towards pickup" : "Enter the 4-digit OTP provided by the rider"}
                        </p>
                        {isEnRoute && (
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2, 3].map((index) => (
                                    <Input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={otp[index] || ""}
                                        onChange={handleOTPInput}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !otp[index] && index > 0) {
                                                document.getElementById(`otp-${index - 1}`)?.focus();
                                            }
                                        }}
                                        className="w-12 h-14 text-center text-xl font-bold border-2 focus:border-primary"
                                        maxLength={1}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {isAccepted && (
                    <Button className="w-full h-11 font-bold" onClick={handleEnRoute} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "I'm En Route"}
                    </Button>
                )}
                {isEnRoute && (
                    <Button className="w-full h-11 font-bold" onClick={handleStartRide} disabled={isLoading || otp.length !== 4}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Start Ride"}
                    </Button>
                )}
                {isStarted && (
                    <Button className="w-full h-11 font-bold bg-green-600 hover:bg-green-700" onClick={handleCompleteRide} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Complete Ride"}
                    </Button>
                )}
                {!isStarted && (
                    <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs" onClick={handleCancelRide} disabled={isLoading}>
                        Cancel Ride
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
