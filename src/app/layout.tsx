import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zaimen",
  description: "A shared wishlist for two — keep the surprises, skip the double gifts.",
  applicationName: "Zaimen",
  appleWebApp: {
    capable: true,
    title: "Zaimen",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#C45C6A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
