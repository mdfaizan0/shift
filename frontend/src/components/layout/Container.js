import React from "react";
import { cn } from "@/lib/utils";

/**
 * Container component to constrain page width and maintain consistent spacing.
 */
const Container = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Container;
