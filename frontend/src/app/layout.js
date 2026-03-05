import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

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
        <html lang="en">
          <head>
            <meta name="apple-mobile-web-app-title" content="Shift" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <link rel="manifest" href="/manifest.json" />
          </head>
          <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
            {children}
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
  );
}