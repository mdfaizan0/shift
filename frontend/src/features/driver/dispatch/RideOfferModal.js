"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, IndianRupee, Clock, ArrowRight, Loader2 } from "lucide-react";
import { rideService } from "@/services/ride.service";
import { calculateTimeLeft, formatTime } from "./dispatch.utils";
import { toast } from "sonner";

/**
 * RideOfferModal displays a single ride request to the driver.
 * Includes a countdown timer and actions to accept/reject.
 */
export default function RideOfferModal({ rideId, rideData, expiresAt, onAccept, onReject, onClose }) {
    const [ride, setRide] = useState(rideData);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiresAt));
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Update ride if rideData changes
    useEffect(() => {
        if (rideData) setRide(rideData);
    }, [rideData]);

    // Countdown Timer
    useEffect(() => {
        if (timeLeft <= 0) {
            onClose();
            return;
        }

        const timer = setInterval(() => {
            const nextTime = calculateTimeLeft(expiresAt);
            setTimeLeft(nextTime);
            if (nextTime <= 0) {
                onClose();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, timeLeft, onClose]);

    const handleAccept = async () => {
        setIsActionLoading(true);
        try {
            const result = await rideService.acceptRide(rideId);
            if (result.success) {
                toast.success("Ride accepted! Head to pickup.");
                onAccept(rideId);
            }
        } catch (error) {
            console.error("Failed to accept ride:", error);
            // Error toast handled by axios interceptor or custom message
            onClose();
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        setIsActionLoading(true);
        try {
            const result = await rideService.rejectRide(rideId);
            if (result.success) {
                onReject(rideId);
            }
        } catch (error) {
            console.error("Failed to reject ride:", error);
            onClose();
        } finally {
            setIsActionLoading(false);
        }
    };


    const progressValue = (timeLeft / 30) * 100; // Assuming 30s timeout

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-linear"
                        style={{ width: `${progressValue}%` }}
                    />
                </div>

                <DialogHeader className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-3 border-primary/20 bg-primary/5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono font-bold text-primary">{formatTime(timeLeft)}</span>
                        </Badge>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none">
                            New Ride Offer
                        </Badge>
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Incoming Request</DialogTitle>
                    <DialogDescription>
                        You have a new ride request nearby.
                    </DialogDescription>
                </DialogHeader>

                {ride && (
                    <div className="space-y-6 py-6">
                        {/* Pickup and Drop Locations */}
                        <div className="relative space-y-4">
                            <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-linear-to-b from-primary via-muted to-muted-foreground/30 border-l-2 border-dashed border-muted-foreground/20" />

                            <div className="flex gap-4 relative">
                                <div className="z-10 bg-background p-1">
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Pickup</p>
                                    <p className="text-sm font-semibold line-clamp-2">{ride.pickup_location}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 relative">
                                <div className="z-10 bg-background p-1">
                                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground ring-4 ring-muted-foreground/20" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Drop-off</p>
                                    <p className="text-sm font-semibold line-clamp-2">{ride.dropoff_location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ride Details (Fare) */}
                        <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <IndianRupee className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Est. Fare</p>
                                    <p className="text-lg font-black italic">₹{ride.fare}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="h-fit">Cash Trip</Badge>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex-row gap-3 sm:justify-between pt-2">
                    <Button
                        variant="ghost"
                        onClick={handleReject}
                        disabled={isActionLoading}
                        className="flex-1 h-12 font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        Decline
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={isActionLoading}
                        className="flex-2 h-12 font-black text-lg shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)]"
                    >
                        {isActionLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Accept Ride
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
