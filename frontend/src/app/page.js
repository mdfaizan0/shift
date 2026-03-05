"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  const { user, role, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background text-foreground">
        <main className="max-w-2xl mx-auto space-y-6 flex flex-col items-center">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-6 w-64" />
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
      <main className="max-w-2xl mx-auto space-y-6">
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
      </main>
    </div>
  );
}
