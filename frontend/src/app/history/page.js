"use client";

import React, { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { rideService } from "@/services/ride.service";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, MapPin, IndianRupee, ChevronRight, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const HistoryPage = () => {
    const { role, isLoading: isAuthLoading } = useAuthUser();
    const [rides, setRides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (!role || isAuthLoading) return;

        const fetchHistory = async () => {
            try {
                const res = await rideService.getRideHistory(role);
                if (res.success) {
                    setRides(res.rides || []);
                } else {
                    setError(res.message || "Failed to fetch history");
                }
            } catch (err) {
                console.error("History fetch error:", err);
                setError("Error connecting to server");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [role, isAuthLoading]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
        }).format(date);
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 min-h-[calc(100vh-5rem)]">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10 hover:bg-muted"
                        onClick={() => router.push("/")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Recent Activity</h1>
                        <p className="text-sm text-muted-foreground">Your past {role.toLowerCase()} journeys</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 rounded-lg bg-destructive/5 border border-destructive/10 text-center">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
            )}

            {/* Structured Trip Log */}
            <div className="space-y-px rounded-xl border border-border/40 overflow-hidden bg-card/50">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-5 flex items-center gap-6 border-b border-border/20 last:border-0">
                            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))
                ) : rides.length > 0 ? (
                    rides.map((ride) => (
                        <Link 
                            key={ride.id} 
                            href={`/history/${ride.id}`}
                            className="group block p-5 md:py-5 md:px-6 hover:bg-muted/30 transition-colors border-b border-border/20 last:border-0"
                        >
                            {/* Mobile Layout */}
                            <div className="md:hidden space-y-3">
                                {/* Row 1: Date + Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="size-3" />
                                        {formatDate(ride.created_at)} · {formatTime(ride.created_at)}
                                    </span>
                                    <Badge 
                                        variant={ride.status === "COMPLETED" ? "success" : "outline"} 
                                        className="text-[9px] h-5 px-2 font-bold uppercase tracking-tight"
                                    >
                                        {ride.status}
                                    </Badge>
                                </div>

                                {/* Row 2: Route */}
                                <div className="space-y-1.5">
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
                                        <p className="text-sm font-medium text-foreground leading-snug">{ride.dropoff_location}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground/80 pl-[18px] truncate">
                                        From: {ride.pickup_location}
                                    </p>
                                </div>

                                {/* Row 3: Fare */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/10">
                                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                        {ride.payment_method}
                                    </span>
                                    <span className="text-sm font-bold text-foreground flex items-center">
                                        <IndianRupee className="size-3 mr-0.5" />
                                        {Number(ride.fare).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-center gap-6">
                                {/* Col 1: Date */}
                                <div className="w-[90px] shrink-0">
                                    <p className="text-sm font-semibold text-foreground">{formatDate(ride.created_at)}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{formatTime(ride.created_at)}</p>
                                </div>

                                {/* Col 2: Route */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="size-2 rounded-full bg-primary shrink-0" />
                                        <p className="text-sm font-medium text-foreground truncate">{ride.dropoff_location}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground/80 ml-4 truncate">
                                        From: {ride.pickup_location}
                                    </p>
                                </div>

                                {/* Col 3: Fare */}
                                <div className="w-[100px] text-right shrink-0">
                                    <p className="text-sm font-bold text-foreground flex items-center justify-end">
                                        <IndianRupee className="size-3 mr-0.5" />
                                        {Number(ride.fare).toFixed(2)}
                                    </p>
                                    <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mt-0.5">
                                        {ride.payment_method}
                                    </p>
                                </div>

                                {/* Col 4: Status */}
                                <div className="w-[90px] flex justify-end shrink-0">
                                    <Badge 
                                        variant={ride.status === "COMPLETED" ? "success" : "outline"} 
                                        className="text-[9px] h-5 px-2 font-bold uppercase tracking-tight"
                                    >
                                        {ride.status}
                                    </Badge>
                                </div>

                                {/* Chevron */}
                                <ChevronRight className="size-4 text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center px-6">
                        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                            <History className="size-8 text-muted-foreground/20" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No activity found</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mb-8">
                            Your past {role.toLowerCase()} journeys will appear here once you complete them.
                        </p>
                        <Button 
                            variant="outline" 
                            className="rounded-full px-8"
                            onClick={() => router.push("/")}
                        >
                            Book now
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
