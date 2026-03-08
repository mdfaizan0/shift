"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, MapPin, Navigation } from "lucide-react";

/**
 * Stages of a ride and their display metadata.
 */
const RIDE_STAGES = [
    { key: "REQUESTED", label: "Requested", icon: Clock },
    { key: "SEARCHING", label: "Finding Driver", icon: Circle },
    { key: "ACCEPTED", label: "Driver Found", icon: CheckCircle2 },
    { key: "DRIVER_EN_ROUTE", label: "En Route", icon: Navigation },
    { key: "STARTED", label: "In Trip", icon: MapPin },
    { key: "COMPLETED", label: "Arrived", icon: CheckCircle2 },
];

const RideStatusTimeline = ({ currentStatus }) => {
    const currentIndex = RIDE_STAGES.findIndex(s => s.key === currentStatus);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div className="w-full pt-12 pb-4">
            <div className="relative flex justify-between">
                {/* Connector Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-muted z-0" />
                <motion.div
                    className="absolute top-5 left-0 h-0.5 bg-primary z-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${(activeIndex / (RIDE_STAGES.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                />

                {RIDE_STAGES.map((stage, index) => {
                    const Icon = stage.icon;
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={stage.key} className="relative z-10 flex flex-col items-center gap-2 group">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    backgroundColor: isActive ? "var(--color-primary)" : "var(--color-muted)",
                                    borderColor: isActive ? "var(--color-primary)" : "var(--color-muted-foreground)",
                                }}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {isCurrent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute -top-8 whitespace-nowrap"
                                    >
                                        <Badge variant="default" className="text-[10px] font-bold uppercase py-0 px-2 tracking-tighter">
                                            {stage.label}
                                        </Badge>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Label for large screens */}
                            <span className={`hidden md:block text-[10px] font-medium mt-1 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
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
