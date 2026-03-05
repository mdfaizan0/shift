"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@clerk/nextjs";
import MapContainer from "@/features/map/MapContainer";
import { createMarker } from "@/utils/map.utils";
import { MAP_CONFIG } from "@/features/map/map.constants";

export default function Home() {
  const { user, role, isLoading } = useAuthUser();

  // Demo marker centered at the default position
  const demoMarkers = [
    createMarker(MAP_CONFIG.DEFAULT_CENTER[0], MAP_CONFIG.DEFAULT_CENTER[1], "demo_marker_1")
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background text-foreground">
        <main className="max-w-4xl w-full mx-auto space-y-6 flex flex-col items-center">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-6 w-80" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background text-foreground">
      {user && (
        <div className="absolute top-8 right-8">
          <UserButton afterSignOutUrl="/login" />
        </div>
      )}
      <main className="max-w-4xl w-full mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Shift
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time ride hailing platform
          </p>
          {user ? (
            <p className="text-lg font-medium text-primary">
              Welcome back, {user.name}! (Role: {role})
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">
              Please sign in to continue
            </p>
          )}
        </div>

        <div className="w-full">
          <MapContainer markers={demoMarkers} />
        </div>
      </main>
    </div>
  );
}
