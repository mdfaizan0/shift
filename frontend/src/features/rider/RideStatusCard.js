"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, ShieldCheck, User, MapPin, IndianRupee } from "lucide-react";

/**
 * RideStatusCard - Professional Live Dashboard for Rider.
 * Focuses on high-contrast labels, clear grouping, and sophisticated clean design.
 */
const RideStatusCard = ({ status = "IDLE", rideData, routeInfo }) => {
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
        <Card className="w-full border-border/50 shadow-sm bg-card overflow-hidden animate-in fade-in duration-700">
            <CardContent className="p-5 space-y-5">
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                     <div className="flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                         <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Trip Feed</span>
                     </div>
                     {renderStatusBadge()}
                </div>

                {status === "IDLE" ? (
                    <div className="py-6 text-center space-y-2">
                        <Car className="h-5 w-5 mx-auto text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground font-medium">
                            Awaiting booking.
                        </p>
                    </div>
                ) : (status === "REQUESTED" || status === "SEARCHING") ? (
                    <div className="flex items-center gap-4 py-2">
                        <Clock className="h-4 w-4 text-primary animate-pulse" />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                            <p className="text-sm font-semibold text-foreground">
                                {status === "SEARCHING" ? "Finding nearest captain..." : "Processing request..."}
                            </p>
                        </div>
                    </div>
                ) : isLive ? (
                    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-500">
                        {/* Route Info */}
                        {routeInfo && (
                            <div className="flex items-center justify-between px-2 pt-1 border-border/30">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase">
                                        {status === "STARTED" ? "To Destination" : "Captain Arrival"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-foreground">{routeInfo.eta} <span className="text-[10px] text-muted-foreground font-bold tracking-widest">MIN</span></span>
                                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground border-l border-border/50 pl-3">{routeInfo.distance?.toFixed(1)} KM</span>
                                </div>
                            </div>
                        )}

                        {/* Compact Driver & PIN Row */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground/60" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-foreground">{rideData?.driver?.name || "Kader Khan"}</p>
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded font-semibold text-muted-foreground uppercase tracking-widest border border-border/50">
                                        {rideData?.driver?.profile?.vehicle_number || "UNKNOWN"}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="text-right border-l pl-4 border-border/50">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">PIN</p>
                                <p className="text-lg font-black tracking-widest text-primary leading-none">{rideData?.otp_code || "----"}</p>
                            </div>
                        </div>

                        {/* Minimal Safety Reminder */}
                        <p className="text-[9px] font-medium text-center text-muted-foreground uppercase tracking-widest">
                            Match vehicle number before boarding.
                        </p>
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-xs font-semibold text-foreground">
                            Finalizing state: {status}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RideStatusCard;
