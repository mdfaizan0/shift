"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, ShieldCheck } from "lucide-react";

const RideStatusCard = ({ status = "IDLE", rideData }) => {
    // Current UI-only implementation with static state
    const renderStatus = () => {
        switch (status) {
            case "SEARCHING":
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-none animate-pulse">Searching for drivers...</Badge>;
            case "ACCEPTED":
                return <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none">Driver en route</Badge>;
            case "STARTED":
                return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none">Ride started</Badge>;
            case "COMPLETED":
                return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-600 border-none">Ride completed</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-none">Ride cancelled</Badge>;
            default:
                return <Badge variant="outline" className="text-muted-foreground">No active ride</Badge>;
        }
    };

    return (
        <Card className="w-full shadow-md overflow-hidden border-primary/5 bg-background">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-wider italic">
                        Live Ride Status
                    </CardTitle>
                    {renderStatus()}
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {status === "IDLE" ? (
                    <div className="py-4 text-center text-sm text-muted-foreground font-light">
                        Your active ride details will appear here once you book.
                    </div>
                ) : status === "SEARCHING" ? (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Clock className="h-5 w-5 text-primary animate-pulse" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Stage</p>
                                <p className="text-sm font-semibold">Broadcasting to nearby drivers...</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Car className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Driver Info</p>
                                <p className="text-sm font-semibold">
                                    {rideData?.driver?.full_name || "John Doe"}
                                    <span className="text-muted-foreground ml-2">({rideData?.driver?.vehicle_number || "MH-12-AB-1234"})</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Safety PIN</p>
                                <p className="text-2xl font-black italic tracking-[0.2em] text-primary">
                                    {rideData?.otp || "4829"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RideStatusCard;
