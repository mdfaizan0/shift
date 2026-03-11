"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, MapPin, Navigation } from "lucide-react";

/**
 * Stages of a ride and their display metadata.
 * Consistently using 6 stages, optimized for space.
 */
const RIDE_STAGES = [
    { key: "REQUESTED", label: "Requested", icon: Clock },
    { key: "SEARCHING", label: "Finding...", icon: Circle },
    { key: "ACCEPTED", label: "Found", icon: CheckCircle2 },
    { key: "DRIVER_EN_ROUTE", label: "En Route", icon: Navigation },
    { key: "STARTED", label: "In Trip", icon: MapPin },
    { key: "COMPLETED", label: "Arrived", icon: CheckCircle2 },
];

const RideStatusTimeline = ({ currentStatus }) => {
    const currentIndex = RIDE_STAGES.findIndex(s => s.key === currentStatus);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div className="w-full pt-16 pb-6 px-2">
            <div className="relative flex justify-between items-center max-w-xl mx-auto">
                {/* Main Track Line */}
                <div className="absolute top-[18px] left-4 right-4 h-[2px] bg-secondary z-0 rounded-full" />

                {/* Progress Fill */}
                <motion.div
                    className="absolute top-[18px] left-4 h-[2px] bg-primary z-0 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `calc(${(activeIndex / (RIDE_STAGES.length - 1)) * 100}% - 32px)` }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                />

                {RIDE_STAGES.map((stage, index) => {
                    const Icon = stage.icon;
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={stage.key} className="relative z-10 flex flex-col items-center group flex-1">
                            {/* Node Circle */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.15 : 1,
                                    borderColor: isActive ? "var(--primary)" : "var(--border)",
                                }}
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" : "bg-card text-muted-foreground/40"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                            </motion.div>

                            {/* Floating Badge (Only for Current Stage) */}
                            <AnimatePresence mode="wait">
                                {isCurrent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="absolute -top-10 whitespace-nowrap"
                                    >
                                        <Badge variant="default" className="text-[9px] font-black uppercase py-0.5 px-2.5 tracking-wider shadow-sm rounded-md">
                                            {stage.label}
                                        </Badge>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Bottom Label (Hidden on small mobile to avoid clutter) */}
                            <span className={`hidden sm:block text-[9px] font-bold mt-2 uppercase tracking-tighter transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground/30"
                                }`}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RideStatusTimeline;
