"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import api from "@/lib/api";

const AuthContext = createContext({
    user: null,
    role: null,
    isLoading: true,
    refreshUser: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
    const { isLoaded: isClerkLoaded, isSignedIn, userId } = useAuth();
    const { user: clerkUser } = useUser();

    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await api.get("/users/me");
            console.log("response", response);
            if (response.data.success) {
                setUser(response.data.user);
                setRole(response.data.user.role);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setRole(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isClerkLoaded) return;

        if (isSignedIn) {
            fetchUserProfile();
        } else {
            setUser(null);
            setRole(null);
            setIsLoading(false);
        }
    }, [isClerkLoaded, isSignedIn, fetchUserProfile]);

    const refreshUser = async () => {
        setIsLoading(true);
        await fetchUserProfile();
    };

    return (
        <AuthContext.Provider value={{ user, role, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
