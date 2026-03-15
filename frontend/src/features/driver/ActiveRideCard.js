"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IndianRupee, Navigation, Phone, CheckCircle2, Loader2, Clock, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { rideService } from "@/services/ride.service";
import { toast } from "sonner";
import { useDriver } from "./DriverProvider";

export default function ActiveRideCard({ ride, routeInfo }) {
    const { refreshStats, setActiveRide } = useDriver();
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);

    const isAccepted = ride.status === "ACCEPTED";
    const isEnRoute = ride.status === "DRIVER_EN_ROUTE";
    const isStarted = ride.status === "STARTED";
    const isCompleted = ride.status === "COMPLETED";
    const isPendingCash = isCompleted && ride.payment_method === "CASH" && ride.payment_status === "PENDING";
    const isFullyDone = isCompleted && (ride.payment_method !== "CASH" || ride.payment_status === "PAID");

    const [reviewOpen, setReviewOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Trigger review dialog when ride is fully done
    React.useEffect(() => {
        if (isFullyDone && !reviewOpen) {
            setReviewOpen(true);
        }
    }, [isFullyDone]);

    const handleSkipReview = () => {
        setReviewOpen(false);
        setActiveRide(null); // Clear active ride after review/skip
    };

    const handleSubmitReview = async () => {
        setIsSubmittingReview(true);
        try {
            const res = await rideService.submitReview(ride.id, { rating, comment });
            if (res.success) {
                toast.success("Passenger rated! Thank you.");
                setReviewOpen(false);
                setActiveRide(null);
            }
        } catch (error) {
            console.error("Review error:", error);
            if (error?.response?.data?.message?.includes("already reviewed")) {
                setReviewOpen(false);
                setActiveRide(null);
            } else {
                toast.error("Failed to submit review");
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const otpString = otp.join("");

    const handleStartRide = async () => {
        if (otpString.length !== 4) {
            toast.error("Please enter the 4-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const res = await rideService.startRide(ride.id, otpString);
            if (res.success) {
                toast.success("Ride started! Drive safely.");
                setActiveRide(res.ride);
                refreshStats();
            } else {
                setOtp(["", "", "", ""]);
                document.getElementById("otp-0")?.focus();
            }
        } catch (error) {
            console.error("Failed to start ride:", error);
            setOtp(["", "", "", ""]);
            document.getElementById("otp-0")?.focus();
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
                setActiveRide(res.ride);
                refreshStats();
            }
        } catch (error) {
            console.error("Failed to complete ride:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkPaid = async () => {
        setIsLoading(true);
        try {
            const res = await rideService.markPaid(ride.id);
            if (res.success) {
                toast.success("Payment marked as received.");
                setActiveRide(null);
                refreshStats();
            }
        } catch (error) {
            console.error("Failed to mark as paid:", error);
            toast.error("Failed to update payment status");
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

    const handleOTPInput = (e, index) => {
        const val = e.target.value.replace(/\D/g, "");
        if (!val) return;

        const newOtp = [...otp];
        newOtp[index] = val[val.length - 1];
        setOtp(newOtp);

        if (index < 3) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                document.getElementById(`otp-${index - 1}`)?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        } else if (e.key === "Enter") {
            if (otpString.length === 4) {
                handleStartRide();
            }
        }
    };

    const steps = [
        { label: "Accepted", active: true, done: isEnRoute || isStarted || isCompleted },
        { label: "En Route", active: isEnRoute || isStarted || isCompleted, done: isStarted || isCompleted },
        { label: "Started", active: isStarted || isCompleted, done: isCompleted },
        { label: "Completed", active: isCompleted, done: isCompleted }
    ];

    return (
        <Card className="w-full shadow-xl border-primary/10 bg-card">
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
                <div className="flex items-center justify-between mb-6 px-1">
                    {steps.map((step, i) => (
                        <React.Fragment key={step.label}>
                            <div className="flex flex-col items-center gap-1.5 relative">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step.done ? "bg-green-600 text-white shadow-md shadow-green-600/20" :
                                    step.active ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30 ring-4 ring-primary/10" :
                                        "bg-secondary text-muted-foreground border border-border"
                                    }`}>
                                    {step.done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${step.active || step.done ? "text-foreground" : "text-muted-foreground"
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors duration-700 rounded-full ${steps[i + 1].active ? "bg-green-500" : "bg-border"
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="space-y-3">
                    {routeInfo && !isCompleted && (
                        <div className="flex items-center justify-between px-2 pb-2 border-b border-border/40">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">
                                    {isStarted ? "To Dropoff" : "To Pickup"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-foreground">{routeInfo.eta} <span className="text-[10px] text-muted-foreground font-bold tracking-widest">MIN</span></span>
                                <span className="text-[10px] font-bold tracking-widest text-muted-foreground border-l border-border/50 pl-3">{routeInfo.distance?.toFixed(1)} KM</span>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <div className="flex-1 w-0.5 bg-muted mx-auto my-1" />
                            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Pickup Point</p>
                                <p className="text-sm font-semibold leading-tight">{ride.pickup_location}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Dropoff Point</p>
                                <p className="text-sm font-semibold leading-tight">{ride.dropoff_location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 dark:bg-muted/30 border border-border/50 rounded-xl">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        <span className="font-bold">{ride.fare}</span>
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
                                        value={otp[index]}
                                        onChange={(e) => handleOTPInput(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="w-12 h-14 text-center text-xl font-black border-2 focus:ring-primary focus:border-primary transition-all duration-200"
                                        maxLength={1}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {isAccepted && (
                    <Button className="w-full h-12 font-bold text-md shadow-lg shadow-primary/20" onClick={handleEnRoute} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "I'm En Route"}
                    </Button>
                )}
                {isEnRoute && (
                    <Button className="w-full h-12 font-bold text-md shadow-lg shadow-primary/20" onClick={handleStartRide} disabled={isLoading || otpString.length !== 4}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Start Ride"}
                    </Button>
                )}
                {isStarted && (
                    <Button className="w-full h-12 font-bold text-md bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" onClick={handleCompleteRide} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Complete Ride"}
                    </Button>
                )}
                {!isStarted && !isCompleted && (
                    <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold py-1 h-8" onClick={handleCancelRide} disabled={isLoading}>
                        Cancel Ride
                    </Button>
                )}
                {isCompleted && isPendingCash && (
                    <Button className="w-full h-12 font-bold text-md bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" onClick={handleMarkPaid} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Mark as Paid"}
                    </Button>
                )}
                {isCompleted && !isPendingCash && (
                    <div className="w-full p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-in zoom-in duration-300">
                        <p className="text-green-600 font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            {ride.payment_status === "PENDING" ? "Awaiting Payment..." : "Ride Completed & Paid"}
                        </p>
                    </div>
                )}
            </CardFooter>

            {/* Review Dialog */}
            <Dialog open={reviewOpen} onOpenChange={(open) => { if(!open) handleSkipReview() }}>
                <DialogContent className="sm:max-w-md bg-card border-border/50 text-foreground animate-in zoom-in-95 duration-300">
                    <DialogHeader className="text-center sm:text-center space-y-3">
                        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Star className="h-6 w-6 text-primary fill-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Rate Your Passenger</DialogTitle>
                        <DialogDescription className="text-sm">
                            How was your experience with {ride.rider?.name?.split(' ')[0] || "this passenger"}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center justify-center gap-6">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star className={`h-10 w-10 ${star <= rating ? "text-primary fill-primary" : "text-muted fill-muted"} transition-colors`} />
                                </button>
                            ))}
                        </div>
                        <textarea 
                            className="w-full h-24 p-3 rounded-xl border border-border/50 bg-secondary/20 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                            placeholder="Add an optional comment... (How was the behavior?)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                        />
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button className="w-full text-lg font-bold h-12 shadow-lg shadow-primary/20" onClick={handleSubmitReview} disabled={isSubmittingReview}>
                            {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Rating"}
                        </Button>
                        <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={handleSkipReview}>
                            Skip
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
