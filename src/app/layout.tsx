import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MehmanJi — Indian Wedding Guest Intelligence & WhatsApp RSVP",
  description:
    "Stop wasting lakhs on uneaten wedding catering. Track real RSVPs, food choices (Veg/Non-Veg/Jain), and guest arrival times effortlessly via WhatsApp.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFFBF5] text-[#1C1917] antialiased selection:bg-[#B91C6C] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
