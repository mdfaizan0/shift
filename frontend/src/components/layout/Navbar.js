"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Container from "./Container";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, LogOut, User, Map as MapIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const UserMenu = ({ user, signOut }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => signOut({ redirectUrl: '/login' })}
            >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

const Navbar = () => {
    const { user, isLoading } = useAuthUser();
    const { signOut } = useClerk();

    const navLinks = [
        { name: "Home", href: "/", icon: MapIcon },
    ];

    return (
        <nav className="sticky top-0 z-1000 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/logo.png"
                                alt="Shift Logo"
                                width={120}
                                height={40}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Auth UI */}
                        {!isLoading && (
                            <>
                                {user ? (
                                    <UserMenu user={user} signOut={signOut} />
                                ) : (
                                    <div className="hidden md:flex items-center gap-4">
                                        <Button variant="ghost" asChild>
                                            <Link href="/login">Login</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href="/register">Register</Link>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Menu */}
                        <div className="flex md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="flex flex-col gap-4">
                                    <SheetTitle className="text-left">Menu</SheetTitle>
                                    <div className="mt-8 flex flex-col gap-4">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                className="flex items-center gap-2 text-lg font-medium"
                                            >
                                                <link.icon className="h-5 w-5" />
                                                {link.name}
                                            </Link>
                                        ))}
                                        {!user && (
                                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                                                <Button variant="ghost" asChild className="justify-start">
                                                    <Link href="/login">Login</Link>
                                                </Button>
                                                <Button asChild className="justify-start">
                                                    <Link href="/register">Register</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </Container>
        </nav>
    );
};

export default Navbar;
