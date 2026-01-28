import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NexusGen - AI Web Generation Platform",
    template: "%s | NexusGen",
  },
  description:
    "Transform your ideas into production-ready web applications with AI-powered generation. Build faster with NexusGen.",
  keywords: [
    "AI",
    "web generation",
    "code generation",
    "React",
    "Next.js",
    "artificial intelligence",
    "web development",
    "automation",
  ],
  authors: [{ name: "NexusGen Team" }],
  creator: "NexusGen",
  publisher: "NexusGen",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://nexusgen.ai"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "NexusGen",
    title: "NexusGen - AI Web Generation Platform",
    description:
      "Transform your ideas into production-ready web applications with AI-powered generation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NexusGen - AI Web Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusGen - AI Web Generation Platform",
    description:
      "Transform your ideas into production-ready web applications with AI-powered generation.",
    images: ["/og-image.png"],
    creator: "@nexusgen",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1222" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
