"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { rideService } from "@/services/ride.service";

const RideBookingCard = ({ pickup, drop, onConfirm, isSubmitting, isLocked }) => {
    const [estimate, setEstimate] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState("CASH");

    const formatCoords = (coords) => {
        if (!coords) return "";
        return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    };

    // Fare Estimation Effect with Debounce
    React.useEffect(() => {
        if (!pickup || !drop || isLocked) {
            if (!isLocked) setEstimate(null);
            return;
        }

        const fetchEstimate = async () => {
            setIsLoading(true);
            try {
                const data = await rideService.estimateFare({
                    pickup_lat: pickup.lat,
                    pickup_lng: pickup.lng,
                    dropoff_lat: drop.lat,
                    dropoff_lng: drop.lng,
                });

                if (data.success) {
                    setEstimate(data.estimate);
                }
            } catch (error) {
                console.error("Fare estimation failed:", error);
                setEstimate(null);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchEstimate, 700);
        return () => clearTimeout(timeoutId);
    }, [pickup, drop, isLocked]);

    const handleConfirm = () => {
        if (onConfirm && pickup && drop && estimate) {
            onConfirm({
                pickup_location: pickup.address || formatCoords(pickup), // fallback to coords if address missing
                dropoff_location: drop.address || formatCoords(drop),
                pickup_lat: pickup.lat,
                pickup_lng: pickup.lng,
                dropoff_lat: drop.lat,
                dropoff_lng: drop.lng,
                payment_method: paymentMethod
            });
        }
    };

    return (
        <Card className="w-full shadow-2xl border-primary/10 bg-card transition-all duration-500">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {isLocked ? "Ride Summary" : "Book a Ride"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <div className="relative">
                        <Input
                            id="pickup"
                            placeholder="Click on the map to set pickup"
                            className="pl-9 bg-secondary/50 dark:bg-muted/20 border-border focus:ring-primary/20 transition-all"
                            value={formatCoords(pickup)}
                            readOnly
                            disabled={isLocked}
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dropoff">Dropoff Location</Label>
                    <div className="relative">
                        <Input
                            id="dropoff"
                            placeholder="Click on the map to set dropoff"
                            className="pl-9 bg-secondary/50 dark:bg-muted/20 border-border focus:ring-primary/20 transition-all"
                            value={formatCoords(drop)}
                            readOnly
                            disabled={isLocked}
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    </div>
                </div>

                {/* Estimate Section */}
                {(isLoading || estimate) && (
                    <div className="pt-4 border-t space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Estimate</span>
                            {isLoading ? (
                                <Skeleton className="h-6 w-20" />
                            ) : (
                                <Badge variant="secondary" className="text-lg px-4 py-1.5 bg-primary/15 dark:bg-primary/10 text-primary border-primary/20 shadow-sm">
                                    ₹{estimate.estimated_fare}
                                </Badge>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-light">Distance</span>
                            {isLoading ? (
                                <Skeleton className="h-4 w-12" />
                            ) : (
                                <span className="font-semibold">{(estimate.distance_km).toFixed(2)} km</span>
                            )}
                        </div>
                        {estimate?.estimated_fare <= 100 && (
                            <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-tight">
                                Base fare applied
                            </Badge>
                        )}
                    </div>
                )}

                {!isLocked && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="mb-2 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div 
                                className={`border rounded-xl p-3 cursor-pointer flex items-center justify-between transition-all duration-300 ${paymentMethod === 'CASH' ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' : 'border-border hover:bg-muted/50'}`}
                                onClick={() => setPaymentMethod('CASH')}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold text-foreground">Cash</span>
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Pay Captain</span>
                                </div>
                                {paymentMethod === 'CASH' && <Check className="h-4 w-4 text-primary animate-in zoom-in duration-300" />}
                            </div>
                            <div 
                                className={`border rounded-xl p-3 cursor-pointer flex items-center justify-between transition-all duration-300 ${paymentMethod === 'RAZORPAY' ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' : 'border-border hover:bg-muted/50'}`}
                                onClick={() => setPaymentMethod('RAZORPAY')}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold text-foreground">Razorpay</span>
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">UPI / Card</span>
                                </div>
                                {paymentMethod === 'RAZORPAY' && <Check className="h-4 w-4 text-primary animate-in zoom-in duration-300" />}
                            </div>
                        </div>
                    </div>
                )}

                {!isLocked && (
                    <Button
                        className="w-full text-lg h-12 mt-2 font-bold"
                        size="lg"
                        disabled={!pickup || !drop || isLoading || isSubmitting}
                        onClick={handleConfirm}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                                Processing...
                            </span>
                        ) : !pickup ? (
                            "Select Pickup"
                        ) : !drop ? (
                            "Select Dropoff"
                        ) : isLoading ? (
                            "Estimating..."
                        ) : (
                            "Confirm Ride"
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default RideBookingCard;
