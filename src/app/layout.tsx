import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="en" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#1F1E1C] font-sans antialiased selection:bg-[#C5A059] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
