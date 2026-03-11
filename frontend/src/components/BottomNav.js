"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, History } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";

/**
 * BottomNav - Persistent mobile-only navigation bar.
 * Designed for one-handed ergonomic use.
 */
const BottomNav = () => {
    const pathname = usePathname();
    const { user } = useAuthUser();

    if (!user) return null;

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Profile", href: "/profile", icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[200px] z-50">
            <nav className="bg-card/98 border border-border/40 shadow-xl rounded-full p-1.5 flex items-center gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2 py-2 px-5 rounded-full transition-all duration-300 ${
                                isActive 
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                                : "text-muted-foreground hover:bg-secondary/50"
                            }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "animate-in zoom-in-75 duration-300" : ""}`} />
                            {isActive && (
                                <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
