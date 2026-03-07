"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Car, ArrowRight, Loader2, CreditCard, AlertCircle, Info } from "lucide-react";
import { userService } from "@/services/user.service";
import { useAuthUser } from "@/hooks/useAuthUser";
import Container from "@/components/layout/Container";
import { toast } from "sonner";
import Image from "next/image";

export default function BecomeADriverPage() {
    const router = useRouter();
    const { role, refreshUser } = useAuthUser();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        license_number: "",
        vehicle_number: ""
    });

    // Validation Regex
    const licenseRegex = /^[A-Z0-9-]{15,16}$/i;
    const vehicleRegex = /^[A-Z0-9]{10}$/i;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const validateForm = () => {
        if (!licenseRegex.test(formData.license_number)) {
            toast.error("Invalid License Number format. (15-16 alphanumeric characters)");
            return false;
        }
        if (!vehicleRegex.test(formData.vehicle_number)) {
            toast.error("Invalid Vehicle Number format. Expected: AA 00 AA 0000");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await userService.becomeADriver(formData);
            if (result.success) {
                await refreshUser();
                router.push("/");
            }
        } catch (error) {
            console.error("Failed to become a driver:", error);
            // Error handling is handled by axios interceptor toast if configured, 
            // but we can add specific handling here if needed.
        } finally {
            setIsLoading(false);
        }
    };

    if (role === "DRIVER") {
        router.push("/");
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-linear-to-b from-background to-muted/20 relative overflow-hidden flex items-center justify-center py-12">
            {/* Animated Background Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[120px] -z-10"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -90, 0],
                    opacity: [0.1, 0.15, 0.1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] -z-10"
            />

            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md mx-auto relative"
                >
                    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-background/60 backdrop-blur-xl relative overflow-hidden ring-1 ring-white/10">
                        {/* Premium Accent Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent" />

                        <CardHeader className="space-y-2 text-center pt-10">
                            <div
                                className="mx-auto bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                            >
                                <Image
                                    src="/logo.png"
                                    alt="Shift Logo"
                                    width={120}
                                    height={40}
                                    className="h-8 w-auto object-contain"
                                    priority
                                />  
                            </div>
                            <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
                                Become a Driver
                            </CardTitle>
                            <CardDescription className="text-base font-medium">
                                Start your journey as a Driver with Shift.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-6 px-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-3 group/field"
                                >
                                    <Label htmlFor="license_number" className="text-sm font-bold flex items-center gap-2.5 group-focus-within/field:text-primary transition-colors">
                                        <CreditCard className="h-4 w-4" />
                                        Driving License Number
                                    </Label>
                                    <Input
                                        id="license_number"
                                        name="license_number"
                                        placeholder="AB0120100001234"
                                        value={formData.license_number}
                                        onChange={handleChange}
                                        required
                                        className="h-13 bg-muted/40 border-muted-foreground/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-lg font-medium"
                                    />
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 pl-1">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>15-16 alphanumeric characters</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-3 group/field"
                                >
                                    <Label htmlFor="vehicle_number" className="text-sm font-bold flex items-center gap-2.5 group-focus-within/field:text-primary transition-colors">
                                        <Car className="h-4 w-4" />
                                        Vehicle Number
                                    </Label>
                                    <Input
                                        id="vehicle_number"
                                        name="vehicle_number"
                                        placeholder="DL01AB1234"
                                        value={formData.vehicle_number}
                                        onChange={handleChange}
                                        required
                                        className="h-13 bg-muted/40 border-muted-foreground/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-lg font-medium"
                                    />
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 pl-1">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>Format: AA00AA0000</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="pt-4"
                                >
                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-xl font-black transition-all shadow-[0_8px_16px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_12px_24px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                                        disabled={isLoading}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div
                                                    key="loader"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center"
                                                >
                                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                    Processing...
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="text"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center"
                                                >
                                                    Register Now
                                                    <ArrowRight className="ml-3 h-6 w-6" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </motion.div>
                            </form>
                        </CardContent>

                        <CardFooter className="pb-10 pt-8 border-t border-white/5 bg-muted/10 px-10">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-start gap-4"
                            >
                                <div className="p-2 bg-green-500/10 rounded-full">
                                    <Info className="h-6 w-6 text-green-500 shrink-0" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-foreground">Secure Verification</p>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                        Your documents undergo verification. By clicking register you agree to our Driver Terms & Safety Protocols.
                                    </p>
                                </div>
                            </motion.div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </Container>
        </div>
    );
}
