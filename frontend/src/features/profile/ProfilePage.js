"use client";

import React from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useClerk } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, LogOut, Shield, ChevronRight, Settings, Mail, Clock, CreditCard, Star } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * ProfilePage - Dedicated profile and logout center for mobile.
 */
const ProfilePage = () => {
    const { user, role } = useAuthUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push("/");
    };

    if (!user) return null;

    // Derived rating info based on role
    const ratingInfo = role?.toLowerCase() === "driver" 
        ? { avg: user.driver_avg_rating, count: user.driver_rating_count }
        : { avg: user.rider_avg_rating, count: user.rider_rating_count };
        
    const ratingDisplay = ratingInfo.count > 0 
        ? `${ratingInfo.avg?.toFixed(1)} (${ratingInfo.count})` 
        : "New User";

    const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";

    const options = [
        { label: "Ride History", icon: Clock, color: "text-primary", path: "/history" },
        ...(role?.toLowerCase() === "driver" ? [{ label: "Earnings", icon: CreditCard, color: "text-emerald-500", path: "/earnings" }] : []),
        { label: "App Settings", icon: Settings, color: "text-muted-foreground/60", path: "#" },
        { label: "Safety & Privacy", icon: Shield, color: "text-muted-foreground/60", path: "#" },
    ];

    return (
        <div className="flex flex-col gap-6 p-6 pb-28 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* TOP PART: Integrated Identity */}
            <header className="flex flex-col items-center text-center space-y-3">
                <div className="relative group">
                    <div className="h-16 w-16 rounded-full bg-secondary/80 border border-border flex items-center justify-center p-1 shadow-sm transition-transform duration-500 group-hover:scale-105">
                        {user.imageUrl ? (
                            <img src={user.imageUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <User className="h-8 w-8 text-muted-foreground/40" />
                        )}
                    </div>
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-bold tracking-tight text-foreground">
                        {user.name || user.username || "Shift User"}
                    </h1>
                    {email && (
                        <p className="text-xs text-muted-foreground mb-1">{email}</p>
                    )}
                    <div className="flex items-center justify-center gap-2 pt-1 pb-1">
                        <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full border border-border/40">
                            <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                            <span className="text-[10px] font-bold text-foreground">{ratingDisplay}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                        {role.toLowerCase() === "driver" && (
                            <Badge variant="outline" className="border-primary/20 text-primary font-bold uppercase tracking-widest text-[8px] py-0 px-2 h-4">
                                Captain
                            </Badge>
                        )}
                        {role.toLowerCase() === "driver" && <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />}
                        <span className="text-[9px] font-medium text-muted-foreground tracking-wide leading-none">
                            Verified Shift Partner
                        </span>
                    </div>
                </div>
            </header>

            {/* BOTTOM PART: Clean Options */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest px-2">
                        Options
                    </p>
                    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
                        {options.map((opt, i) => (
                            <div 
                                key={opt.label}
                                onClick={() => opt.path !== "#" && router.push(opt.path)}
                                className={`flex items-center justify-between p-4 px-5 hover:bg-secondary/30 transition-colors cursor-pointer ${
                                    i < options.length - 1 ? "border-b border-border/40" : ""
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-1.5 rounded-lg bg-secondary/50 ${opt.color}`}>
                                        <opt.icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-sm text-foreground/80">{opt.label}</span>
                                </div>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        variant="ghost" 
                        className="w-full h-12 rounded-xl font-bold text-sm gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive transition-all border border-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        LOG OUT
                    </Button>
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground/40 mt-4">
                    v1.0.0 • 2026
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;
