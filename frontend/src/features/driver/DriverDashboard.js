"use client";

import React from "react";
import MapContainer from "@/features/map/MapContainer";
import DriverAvailabilityCard from "./DriverAvailabilityCard";
import { DriverProvider } from "./DriverProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, History, Star } from "lucide-react";

/**
 * Inner dashboard component that consumes DriverProvider.
 */
const DriverDashboardInternal = () => {
    return (
        <div className="relative flex flex-col md:flex-row gap-6 min-h-[calc(100vh-10rem)]">
            {/* Sidebar / Controls Overlay */}
            <div className="w-full md:w-[400px] flex flex-col gap-6 z-10">
                <section>
                    <DriverAvailabilityCard />
                </section>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <IndianRupee className="h-4 w-4 text-primary mb-2" />
                            <span className="text-2xl font-bold">₹0</span>
                            <span className="text-xs text-muted-foreground">Today's Earnings</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <Star className="h-4 w-4 text-yellow-500 mb-2" />
                            <span className="text-2xl font-bold">5.0</span>
                            <span className="text-xs text-muted-foreground">Rating</span>
                        </CardContent>
                    </Card>
                </div>

                <section>
                    <Card className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 text-muted-foreground">
                                <p className="text-sm">No recent rides found.</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <div className="hidden md:block flex-1 bg-linear-to-t from-muted/50 to-transparent rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground italic">
                        &quot;Drive responsibly. Your safety and the rider's safety are paramount.&quot;
                    </p>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full order-first md:order-last">
                <div className="sticky top-24 h-[400px] md:h-[calc(100vh-12rem)] min-h-[400px]">
                    <MapContainer className="h-full w-full" />
                </div>
            </div>
        </div>
    );
};

/**
 * DriverDashboard feature component wrapped with DriverProvider.
 */
const DriverDashboard = () => {
    return (
        <DriverProvider>
            <DriverDashboardInternal />
        </DriverProvider>
    );
};

export default DriverDashboard;
