import { useAuthContext } from "@/features/auth/AuthProvider";

export const useAuthUser = () => {
    const context = useAuthContext();

    if (context === undefined) {
        throw new Error("useAuthUser must be used within an AuthProvider");
    }

    return context;
};
