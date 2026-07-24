import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_Arabic, Outfit } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const arabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: { default: "NURAA | Modern Arabian Home Fragrance", template: "%s | NURAA" },
  description: "Modern Arabian home fragrance inspired by oud, amber and timeless hospitality, delivered across Saudi Arabia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("h-full", "antialiased", display.variable, arabic.variable, "font-sans", sans.variable)}>
      <body className="min-h-full flex flex-col"><TooltipProvider>{children}</TooltipProvider></body>
    </html>
  );
}
