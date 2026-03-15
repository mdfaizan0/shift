"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/layout/Container";

const AuthGuard = ({ children, publicOnly = false }) => {
    const { user, isLoading } = useAuthUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!user && !publicOnly && pathname !== "/login" && pathname !== "/register") {
            router.replace("/login");
        } else if (user && publicOnly) {
            router.replace("/");
        }
    }, [user, isLoading, publicOnly, router, pathname]);

    if (isLoading) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="space-y-4 w-full max-w-md">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </Container>
        );
    }

    if (!user && !publicOnly && pathname !== "/login" && pathname !== "/register") {
        return null;
    }

    if (user && publicOnly) {
        return null;
    }

    return children;
};

export default AuthGuard;
