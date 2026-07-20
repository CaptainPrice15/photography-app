import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/components/shared/MotionProvider";
import { AmbientBackground } from "@/components/theme/AmbientBackground";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const displaySans = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const SITE_URL = "https://lumen-photo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lumen — Photography",
    template: "%s · Lumen",
  },
  description:
    "A modern photography showcase. Explore curated collections, a responsive masonry gallery, and the latest work.",
  keywords: ["photography", "gallery", "portfolio", "collections", "Lumen"],
  openGraph: {
    title: "Lumen — Photography",
    description:
      "A modern photography showcase with dynamic theming and a responsive gallery.",
    url: SITE_URL,
    siteName: "Lumen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen — Photography",
    description: "A modern photography showcase with dynamic theming.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090c" },
  ],
};

import { CursorSpotlight } from "@/components/theme/CursorSpotlight";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${displaySans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <CursorSpotlight />
            <AmbientBackground />
            <Navbar session={session} />
            <main className="flex min-h-screen flex-col pt-16">{children}</main>
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
