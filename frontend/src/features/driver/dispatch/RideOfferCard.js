"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Clock, ArrowRight, Loader2, X } from "lucide-react";
import { calculateTimeLeft, formatTime } from "./dispatch.utils";
import { motion } from "framer-motion";

/**
 * RideOfferCard is a concise, non-blocking component to display a ride request.
 * Designed to be shown in a list/stack.
 */
export default function RideOfferCard({ ride, dispatch, onAccept, onReject }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(dispatch.expires_at));
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            const nextTime = calculateTimeLeft(dispatch.expires_at);
            setTimeLeft(nextTime);
        }, 1000);

        return () => clearInterval(timer);
    }, [dispatch.expires_at, timeLeft]);

    // Cleanup if time runs out
    useEffect(() => {
        if (timeLeft <= 0) {
            onReject(dispatch.ride_id, true); // true for "auto-rejection/expiry"
        }
    }, [timeLeft, onReject, dispatch.ride_id]);

    const handleAccept = async () => {
        setIsActionLoading(true);
        try {
            await onAccept(dispatch.ride_id);
        } finally {
            setIsActionLoading(false);
        }
    };

    const progressValue = (timeLeft / 30) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9, boxShadow: "0 0 0px rgba(var(--color-primary), 0)" }}
            animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.3)", "0 0 0px rgba(59, 130, 246, 0)"]
            }}
            exit={{
                opacity: 0,
                x: 20,
                scale: 0.95,
                transition: { duration: 0.4, ease: "anticipate" }
            }}
            transition={{
                duration: 0.5,
                boxShadow: { duration: 1, repeat: 1 }
            }}
            layout
        >
            <Card className={`relative overflow-hidden shadow-xl bg-background/95 backdrop-blur-sm transition-all duration-300 border-2 ${timeLeft <= 10
                ? "border-red-600 animate-pulse shadow-red-500/20"
                : timeLeft <= 20
                    ? "border-orange-600 shadow-orange-500/10"
                    : "border-orange-400/50 shadow-primary/5"
                }`}>
                {/* Timer Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-muted/50">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? "bg-red-500" : timeLeft < 20 ? "bg-orange-500" : "bg-primary"
                            }`}
                        style={{ width: `${progressValue}%` }}
                    />
                </div>

                <CardContent className="p-4 pt-5">
                    <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                    New Trip
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(timeLeft)} left
                                </span>
                            </div>
                            <h3 className="font-bold text-base tracking-tight italic">Ride Request</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onReject(dispatch.ride_id)}
                            disabled={isActionLoading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex gap-3">
                            <div className="flex flex-col gap-1 items-center py-1">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <div className="flex-1 w-px bg-dashed bg-muted-foreground/20 mx-auto" />
                                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-2 min-w-0">
                                <p className="text-xs font-semibold line-clamp-1 text-foreground/80">{ride.pickup_location}</p>
                                <p className="text-xs font-medium line-clamp-1 text-muted-foreground">{ride.dropoff_location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-1.5">
                            <IndianRupee className="h-4 w-4 text-green-600" />
                            <span className="text-lg font-black tracking-tighter italic">₹{ride.fare}</span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-3 border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-bold"
                                onClick={() => onReject(dispatch.ride_id)}
                                disabled={isActionLoading}
                            >
                                Pass
                            </Button>
                            <Button
                                size="sm"
                                className="h-9 px-4 font-black text-xs shadow-lg shadow-primary/20"
                                onClick={handleAccept}
                                disabled={isActionLoading}
                            >
                                {isActionLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <>
                                        Accept
                                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
