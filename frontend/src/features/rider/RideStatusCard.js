"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, ShieldCheck, User, MapPin, IndianRupee } from "lucide-react";

/**
 * RideStatusCard - Professional Live Dashboard for Rider.
 * Focuses on high-contrast labels, clear grouping, and sophisticated clean design.
 */
const RideStatusCard = ({ status = "IDLE", rideData }) => {
    const renderStatusBadge = () => {
        const badgeClass = "text-[10px] font-black uppercase tracking-widest border-none px-3 py-1 shadow-sm";
        switch (status) {
            case "REQUESTED":
                return <Badge className={`${badgeClass} bg-orange-500/10 text-orange-600`}>Awaiting Dispatch</Badge>;
            case "SEARCHING":
                return <Badge className={`${badgeClass} bg-blue-500/10 text-blue-600 animate-pulse`}>Searching Nearby</Badge>;
            case "ACCEPTED":
                return <Badge className={`${badgeClass} bg-indigo-500/10 text-indigo-600`}>Captain Assigned</Badge>;
            case "DRIVER_EN_ROUTE":
                return <Badge className={`${badgeClass} bg-indigo-500/10 text-indigo-600`}>Captain En Route</Badge>;
            case "STARTED":
                return <Badge className={`${badgeClass} bg-green-500/10 text-green-600`}>Trip Active</Badge>;
            case "COMPLETED":
                return <Badge className={`${badgeClass} bg-zinc-500/10 text-zinc-600`}>Arrived</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive" className={badgeClass}>Cancelled</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-dashed">No Active Session</Badge>;
        }
    };

    const isLive = ["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status);

    return (
        <Card className="w-full shadow-2xl border-primary/10 bg-card/95 backdrop-blur-xl overflow-hidden animate-in fade-in duration-700">
            {/* Minimal Header */}
            <CardHeader className="pb-4 border-b border-border/40 bg-secondary/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
                        Live Tracking Hub
                    </CardTitle>
                    {renderStatusBadge()}
                </div>
            </CardHeader>

            <CardContent className="pt-8 space-y-8">
                {status === "IDLE" ? (
                    <div className="py-12 text-center space-y-3">
                        <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/30">
                            <Car className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium italic">
                            Your live feed will activate once you book.
                        </p>
                    </div>
                ) : (status === "REQUESTED" || status === "SEARCHING") ? (
                    <div className="flex items-center gap-5 p-5 rounded-2xl bg-secondary/40 border border-border/50 animate-pulse">
                        <div className="p-3 bg-white dark:bg-muted-foreground/10 rounded-xl shadow-sm">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Status</p>
                            <p className="text-md font-bold text-foreground">
                                {status === "SEARCHING" ? "Analyzing captain availability..." : "Processing booking request..."}
                            </p>
                        </div>
                    </div>
                ) : isLive ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                        {/* Driver & Info Block */}
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/30">
                            <div className="h-14 w-14 rounded-full bg-white dark:bg-muted/30 flex items-center justify-center shadow-inner border border-border">
                                <User className="h-6 w-6 text-primary/60" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned Captain</p>
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-lg font-black tracking-tight">{rideData?.driver?.name || "Kader Khan"}</h3>
                                    <Badge variant="outline" className="text-[10px] font-black bg-white dark:bg-muted/30 border-primary/20 text-primary">
                                        {rideData?.driver?.vehicle_number || "AA00AA0000"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Safety PIN Section - High Hierarchy */}
                        <div className="p-6 rounded-3xl bg-secondary/50 border border-border relative overflow-hidden group">
                            <div className="flex justify-between items-center relative z-10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Safety PIN</span>
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground leading-snug max-w-[120px]">
                                        Secure verification to start your journey.
                                    </p>
                                </div>
                                <div className="text-4xl font-black italic tracking-[0.2em] text-primary drop-shadow-sm">
                                    {rideData?.otp_code || "----"}
                                </div>
                            </div>
                            {/* Subtle Background Icon */}
                            <ShieldCheck className="absolute -right-6 -bottom-6 h-24 w-24 text-primary opacity-[0.03] rotate-12" />
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center bg-muted/20 border border-dashed rounded-2xl">
                        <p className="text-sm font-bold text-foreground italic px-6">
                            Finalizing ride details... Current state: {status}
                        </p>
                    </div>
                )}
            </CardContent>

            {/* Safety Reminder Footer */}
            {isLive && (
                <div className="px-6 py-4 bg-muted/30 border-t border-border/40">
                    <p className="text-[9px] font-bold text-center text-muted-foreground uppercase tracking-widest leading-none flex items-center justify-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-primary/50" />
                        Match Vehicle Number Before Boarding
                        <span className="h-1 w-1 rounded-full bg-primary/50" />
                    </p>
                </div>
            )}
        </Card>
    );
};

export default RideStatusCard;
