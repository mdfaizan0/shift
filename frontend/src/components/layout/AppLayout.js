import React from "react";
import Navbar from "./Navbar";

/**
 * AppLayout component that wraps the entire application.
 * Provides the global navigation and consistent content area.
 */
const AppLayout = ({ children }) => {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
        </div>
    );
};

export default AppLayout;
