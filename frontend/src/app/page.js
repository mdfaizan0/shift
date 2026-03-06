"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { Skeleton } from "@/components/ui/skeleton";
import MapContainer from "@/features/map/MapContainer";
import { createMarker } from "@/utils/map.utils";
import { MAP_CONFIG } from "@/features/map/map.constants";
import Container from "@/components/layout/Container";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Home() {
  const { user, role, isLoading } = useAuthUser();

  // Demo marker centered at the default position
  const demoMarkers = [
    createMarker(MAP_CONFIG.DEFAULT_CENTER[0], MAP_CONFIG.DEFAULT_CENTER[1], "demo_marker_1")
  ];

  return (
    <AuthGuard>
      <Container className="py-8 text-center">
        <main className="max-w-4xl w-full mx-auto space-y-8">
          <div className="space-y-4">
            {user ? (
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h2>
                <p className="text-lg text-muted-foreground">You are currently logged in as a <span className="text-primary font-semibold">{role}</span></p>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Real-time ride hailing platform</h2>
                <p className="text-lg text-muted-foreground">Please sign in to continue</p>
              </div>
            )}
          </div>

          <div className="w-full">
            <MapContainer markers={demoMarkers} />
          </div>
        </main>
      </Container>
    </AuthGuard>
  );
}
