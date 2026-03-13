"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { rideService } from "@/services/ride.service";
import MapContainer from "@/features/map/MapContainer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Calendar,
    Clock,
    IndianRupee,
    CreditCard,
    Download,
    Star,
    ShieldCheck,
    MapPin,
    Navigation2
} from "lucide-react";
import { toast } from "sonner";

const RideDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { role, isLoading: isAuthLoading } = useAuthUser();
    const [ride, setRide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await rideService.getRideById(id);
                if (res.success) {
                    setRide(res.ride);
                } else {
                    toast.error(res.message || "Failed to load ride details");
                    router.push("/history");
                }
            } catch (err) {
                console.error("Fetch details error:", err);
                toast.error("An error occurred while fetching details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id, router]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
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

    if (isLoading || isAuthLoading) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
                <Skeleton className="h-8 w-32 rounded-full" />
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-[400px] space-y-4">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                    <Skeleton className="flex-1 h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!ride) return null;

    const otherUser = role.toLowerCase() === "rider" ? ride.driver : ride.rider;
    const hasReview = ride.reviews && ride.reviews.length > 0;
    const review = hasReview ? ride.reviews[0] : null;

    const ratingInfo = role.toLowerCase() === "driver"
        ? { avg: otherUser?.rider_avg_rating, count: otherUser?.rider_rating_count }
        : { avg: otherUser?.driver_avg_rating, count: otherUser?.driver_rating_count };

    const ratingDisplay = ratingInfo.count > 0
        ? `${ratingInfo.avg?.toFixed(1)} (${ratingInfo.count})`
        : "No ratings yet";

    return (
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-muted-foreground hover:text-foreground pl-0"
                    onClick={() => router.push("/history")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to History
                </Button>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase opacity-60">
                        ID: {ride.id.split('-')[0]}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Column: Details (Dashboard Style Sidebar) */}
                <div className="w-full lg:w-[420px] flex flex-col gap-8 order-last lg:order-first">

                    {/* Passenger/Driver Info Block */}
                    <section className="bg-muted/30 rounded-2xl p-6 border border-border/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                            {role === "rider" ? "Captain Details" : "Passenger Details"}
                        </p>
                        {otherUser ? (
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 rounded-full border-2 border-background shadow-sm">
                                    <AvatarImage src={otherUser.profile?.imageUrl} />
                                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                        {otherUser.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{otherUser.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
                                        <span className="text-sm font-medium tracking-wider">
                                            {ratingDisplay}
                                        </span>
                                        <span className="text-muted-foreground/30 mx-1">•</span>
                                        <span className="text-xs font-semibold text-primary/80 uppercase tracking-tight">Verified</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Information unavailable</p>
                        )}
                    </section>

                    {/* Trip Details Section */}
                    <section className="space-y-8 px-2">
                        {/* Route Timeline */}
                        <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:border-l before:border-dashed before:border-border">
                            <div className="relative flex gap-4">
                                <div className="h-6 w-6 rounded-full bg-background border-2 border-primary z-10 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Pickup</p>
                                    <p className="text-sm font-medium leading-normal">{ride.pickup_location}</p>
                                </div>
                            </div>
                            <div className="relative flex gap-4">
                                <div className="h-6 w-6 rounded-full bg-background border-2 border-red-500/50 z-10 flex items-center justify-center">
                                    <MapPin className="h-3 w-3 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Dropoff</p>
                                    <p className="text-sm font-medium leading-normal">{ride.dropoff_location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-4 border-t border-border/40">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="size-3" /> Date
                                </span>
                                <p className="text-sm font-semibold">{formatDate(ride.created_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="size-3" /> Time
                                </span>
                                <p className="text-sm font-semibold">{formatTime(ride.created_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <IndianRupee className="size-3" /> Total Fair
                                </span>
                                <div className="flex items-center gap-2">
                                    <p className="text-base font-bold text-foreground">₹{ride.fare}</p>
                                    <Badge variant="outline" className="text-[9px] h-4 font-black uppercase tracking-tighter bg-muted/50">
                                        {ride.payment_method}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck className="size-3" /> Status
                                </span>
                                <Badge variant={ride.status === "COMPLETED" ? "success" : "outline"} className="text-[10px] font-black uppercase px-2 h-5">
                                    {ride.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Review Display */}
                        {hasReview && (
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mt-4">
                                <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "text-primary fill-primary" : "text-muted/40 fill-muted/40"}`} />
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-foreground/80 italic leading-snug">
                                    &quot;{review.comment || "Completed without issue."}&quot;
                                </p>
                            </div>
                        )}

                        <Button variant="outline" disabled className="w-full h-11 text-xs font-bold rounded-xl border-dashed">
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Download Invoice PDF
                        </Button>
                    </section>
                </div>

                {/* Right Column: Map Area */}
                <div className="flex-1 min-h-[200px] md:min-h-[400px]">
                    <div className="sticky top-24 h-[200px] md:h-[550px] rounded-3xl overflow-hidden border border-border/40 shadow-sm">
                        <MapContainer
                            isPreview={true}
                            pickup={{ lat: ride.pickup_lat, lng: ride.pickup_lng }}
                            drop={{ lat: ride.dropoff_lat, lng: ride.dropoff_lng }}
                            status={ride.status}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideDetailPage;
