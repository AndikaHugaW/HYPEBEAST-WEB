import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavigation from "@/components/ConditionalNavigation";
// Import font Nippo dari Figma
import localFont from "next/font/local";

// Konfigurasi Font Nippo dari Figma
const nippo = localFont({
  src: [
    {
      path: "../public/fonts/Nippo-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Nippo-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Nippo-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Nippo-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Nippo-Extralight.otf",
      weight: "200",
      style: "normal",
    },
  ],
  variable: "--font-nippo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HYPEBEAST",
  description: "HYPEBEAST Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nippo.variable}`}>
        {/* ConditionalNavigation will handle its own logic to hide on admin pages */}
        <ConditionalNavigation />
        {children}
      </body>
    </html>
  );
}

