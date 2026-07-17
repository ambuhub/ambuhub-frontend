import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientRootProviders } from "./providers";
import { siteMetadataBase } from "@/lib/seo-metadata";
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
  metadataBase: siteMetadataBase(),
  title: {
    default: "Ambuhub | Book ambulance standby, crew & equipment",
    template: "%s | Ambuhub",
  },
  description:
    "Book on-site medical standby for events, arrange scheduled transports, hire ambulance personnel, arrange fleet servicing, and buy or sell equipment—in one marketplace.",
  openGraph: {
    type: "website",
    locale: "en",
    siteName: "Ambuhub",
  },
  icons: {
    icon: "/ambuhub-logo.png",
    apple: "/ambuhub-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientRootProviders>{children}</ClientRootProviders>
      </body>
    </html>
  );
}
