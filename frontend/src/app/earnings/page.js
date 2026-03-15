"use client";

import { useEffect, useState } from "react";
import { driverService } from "@/services/driver.service";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, TrendingUp, Calendar, LayoutGrid, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const EarningsPage = () => {
    const { role, isLoading: isAuthLoading } = useAuthUser();
    const router = useRouter();
    const [earnings, setEarnings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    if (role?.toLowerCase() !== "driver") {
        return null;
    }

    useEffect(() => {
        if (!isAuthLoading && role?.toLowerCase() !== "driver") {
            router.push("/");
            return;
        }

        const fetchEarnings = async () => {
            try {
                const res = await driverService.getEarnings();
                if (res.success) {
                    setEarnings(res.earnings);
                }
            } catch (error) {
                console.error("Failed to fetch earnings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (role?.toLowerCase() === "driver") {
            fetchEarnings();
        }
    }, [role, isAuthLoading, router]);


    const stats = [
        {
            title: "Today's Earnings",
            value: earnings?.today_earnings || 0,
            icon: IndianRupee,
            iconColor: "text-emerald-500",
            accentColor: "bg-emerald-500",
        },
        {
            title: "Month Earnings",
            value: earnings?.month_earnings || 0,
            icon: TrendingUp,
            iconColor: "text-blue-500",
            accentColor: "bg-blue-500",
        },
        {
            title: "Total Earnings",
            value: earnings?.total_earnings || 0,
            icon: Calendar,
            iconColor: "text-violet-500",
            accentColor: "bg-violet-500",
        },
        {
            title: "Completed Rides",
            value: earnings?.total_completed_rides || 0,
            icon: CheckCircle2,
            iconColor: "text-orange-500",
            accentColor: "bg-orange-500",
            isCount: true
        }
    ];

    if (isLoading || isAuthLoading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
                <Skeleton className="h-4 w-24 rounded-full" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl w-full" />
                    ))}
                </div>
                <Skeleton className="h-[280px] rounded-3xl w-full" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-20 space-y-10">
            <header className="space-y-5">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full pl-0 text-muted-foreground hover:text-foreground h-auto p-0 hover:bg-transparent"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back</span>
                </Button>
                
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Earnings</h1>
                    <p className="text-xs text-muted-foreground font-medium">Your performance and revenue at a glance</p>
                </div>
            </header>

            <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.08
                        }
                    }
                }}
            >
                {stats.map((stat) => (
                    <motion.div
                        key={stat.title}
                        variants={{
                            hidden: { y: 12, opacity: 0 },
                            visible: { y: 0, opacity: 1 }
                        }}
                    >
                        <Card className="border border-border/40 bg-card/60 overflow-hidden hover:border-border/70 transition-all duration-400 rounded-2xl group">
                            <CardContent className="p-4 pb-3.5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                                        {stat.title}
                                    </span>
                                    <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                                </div>
                                <div className="text-2xl font-black tracking-tight">
                                    {!stat.isCount && <span className="text-base mr-0.5 text-muted-foreground/40 font-bold">₹</span>}
                                    {stat.value.toLocaleString('en-IN')}
                                </div>
                                <div className={`h-[2px] w-6 ${stat.accentColor}/25 rounded-full group-hover:w-full transition-all duration-700`} />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <Card className="border border-border/30 shadow-none bg-muted/15 rounded-3xl overflow-hidden">
                    <CardHeader className="p-6 pb-3">
                        <CardTitle className="text-sm font-black flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-background border border-border/50 flex items-center justify-center">
                                <LayoutGrid className="h-4 w-4 text-primary" />
                            </div>
                            Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[240px] p-6 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                            <div className="relative h-14 w-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center">
                                <TrendingUp className="h-7 w-7 text-muted-foreground/15" />
                            </div>
                        </div>
                        <div className="space-y-1.5 max-w-xs">
                            <h3 className="text-sm font-black text-foreground tracking-tight">Advanced Analytics</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Detailed charts and demand heatmaps coming soon to help you maximize revenue.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default EarningsPage;
