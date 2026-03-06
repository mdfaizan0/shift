import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import AppLayout from "@/components/layout/AppLayout";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Shift",
  description: "Real-time ride hailing platform",
};

export default function RootLayout({
  children,
}) {
  return (
    <ClerkProvider>
      <AuthProvider>
        <html lang="en" suppressHydrationWarning>
          <head>
            <meta name="apple-mobile-web-app-title" content="Shift" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <link rel="manifest" href="/manifest.json" />
          </head>
          <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <AppLayout>
                {children}
              </AppLayout>
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
  );
}