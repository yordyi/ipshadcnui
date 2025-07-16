import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PWARegister from "@/components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Device Information Portal",
  description: "Comprehensive system and network analysis dashboard",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DeviceInfo",
  },
  icons: {
    icon: [
      { url: "/api/icon/192", sizes: "192x192", type: "image/png" },
      { url: "/api/icon/512", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/api/icon/180", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
