"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Clock, User, IndianRupee, CreditCard, Star, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { rideService } from "@/services/ride.service";
import { toast } from "sonner";
import Script from "next/script";

/**
 * RideStatusCard - Professional Live Dashboard for Rider.
 * Focuses on high-contrast labels, clear grouping, and sophisticated clean design.
 */
const RideStatusCard = ({ status = "IDLE", rideData, routeInfo, onClose }) => {
    const [isPaying, setIsPaying] = React.useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
    const [reviewOpen, setReviewOpen] = React.useState(false);
    const [rating, setRating] = React.useState(5);
    const [comment, setComment] = React.useState("");
    const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

    const isLive = ["ACCEPTED", "DRIVER_EN_ROUTE", "STARTED"].includes(status);
    const isCompleted = status === "COMPLETED";
    const needsPayment = isCompleted && rideData?.payment_method === "RAZORPAY" && ["PENDING", "PROCESSING"].includes(rideData?.payment_status);
    // backend getActiveRide or getRideHistory doesn't return `reviewed` flag easily, so we might need to assume it's unreviewed initially.
    // Actually wait, reviewing is optional! Let's just open the dialog automatically when PAID is reached.

    const handlePayment = async () => {
        setIsPaying(true);
        try {
            const res = await rideService.payOrder(rideData.id);
            if (res.success) {
                const options = {
                    key: res.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // fallback to env
                    amount: res.amount,
                    currency: res.currency,
                    name: "Shift",
                    description: "Ride Payment",
                    order_id: res.order_id,
                    handler: function (response) {
                        toast.success("Payment successful! Processing...");
                        // Realtime subscription will update the ride shortly
                    },
                    theme: {
                        color: "#0f172a" // Sophisticated dark
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error("Payment failed. Please try again.");
                });
                rzp.open();
            } else {
                toast.error(res.message || "Failed to initiate payment");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Error connecting to payment gateway.");
        } finally {
            setIsPaying(false);
        }
    };

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
                if (needsPayment) return <Badge className={`${badgeClass} bg-red-500/10 text-red-600 animate-pulse`}>Payment Required</Badge>;
                return <Badge className={`${badgeClass} bg-zinc-500/10 text-zinc-600`}>Arrived</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive" className={badgeClass}>Cancelled</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-dashed">No Active Session</Badge>;
        }
    };

    React.useEffect(() => {
        if (needsPayment && !paymentDialogOpen) {
            setPaymentDialogOpen(true);
        }
    }, [needsPayment]);

    React.useEffect(() => {
        if (isCompleted && rideData?.payment_status === "PAID" && !reviewOpen) {
            setPaymentDialogOpen(false);
            setReviewOpen(true);
        }
    }, [isCompleted, rideData?.payment_status]);

    const handleSubmitReview = async () => {
        setIsSubmittingReview(true);
        try {
            const res = await rideService.submitReview(rideData.id, { rating, comment });
            if (res.success) {
                toast.success("Thank you for your feedback!");
                setReviewOpen(false);
                if (onClose) onClose();
            } else {
                toast.error(res.message || "Failed to submit review");
            }
        } catch (error) {
            console.error("Review error:", error);
            // Even if review fails (e.g., already reviewed), we can let the user close it.
            if (error?.response?.data?.message?.includes("already reviewed")) {
                toast.success("You already reviewed this ride. Thanks!");
                setReviewOpen(false);
                if (onClose) onClose();
            } else {
                toast.error("Error submitting review");
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleSkipReview = () => {
        setReviewOpen(false);
        if (onClose) onClose();
    }

    return (
        <>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        
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
                            Awaiting booking
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
                ) : isCompleted ? (
                    <div className="py-6 text-center space-y-4 animate-in zoom-in duration-500">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-foreground">You have arrived.</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Thank you for riding with Shift.</p>
                        </div>

                        {needsPayment && (
                            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                                <p className="text-red-500 text-sm font-bold">
                                    Complete payment before booking another ride.
                                </p>
                                <Button className="mt-4 w-full h-12 font-bold shadow-lg shadow-primary/20" onClick={() => setPaymentDialogOpen(true)}>
                                    Pay ₹{rideData.fare} Securely
                                </Button>
                            </div>
                        )}

                        {/* Payment Dialog */}
                        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                            <DialogContent className="sm:max-w-md bg-card border-border/50 text-foreground animate-in zoom-in-95 duration-300">
                                <DialogHeader className="text-center sm:text-center space-y-3">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CreditCard className="h-6 w-6 text-primary" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black">Ride Payment</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        Complete your online payment for the ride with <strong>{rideData.driver?.name?.split(' ')[0] || "your captain"}</strong>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-6 flex flex-col items-center justify-center gap-6">
                                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 w-full flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Fare</span>
                                        <span className="text-3xl font-black text-foreground flex items-center"><IndianRupee className="h-6 w-6 mr-0.5"/>{rideData.fare}</span>
                                    </div>
                                </div>
                                <DialogFooter className="flex-col sm:flex-col gap-2">
                                    <Button className="w-full text-lg font-bold h-12 shadow-lg shadow-primary/20" onClick={handlePayment} disabled={isPaying}>
                                        {isPaying ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                        Pay Now
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {rideData?.payment_method === "CASH" && rideData?.payment_status === "PENDING" && (
                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mt-4">
                                <p className="text-orange-600 font-bold text-sm flex items-center justify-center gap-2">
                                    <IndianRupee className="h-4 w-4" /> Please pay ₹{rideData.fare} in cash to the captain.
                                </p>
                            </div>
                        )}
                        {/* Review Dialog */}
                        <Dialog open={reviewOpen} onOpenChange={(open) => { if(!open) handleSkipReview() }}>
                            <DialogContent className="sm:max-w-md bg-card border-border/50 text-foreground animate-in zoom-in-95 duration-300">
                                <DialogHeader className="text-center sm:text-center space-y-3">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Star className="h-6 w-6 text-primary fill-primary" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black">Rate Your Captain</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        How was your ride with {rideData.driver?.name?.split(' ')[0] || "your captain"}?
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
                                        placeholder="Add an optional comment... (What went well?)"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        maxLength={500}
                                    />
                                </div>
                                <DialogFooter className="flex-col sm:flex-col gap-2">
                                    <Button className="w-full text-lg font-bold h-12 shadow-lg shadow-primary/20" onClick={handleSubmitReview} disabled={isSubmittingReview}>
                                        {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Review"}
                                    </Button>
                                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={handleSkipReview}>
                                        Skip
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
        </>
    );
};

export default RideStatusCard;
