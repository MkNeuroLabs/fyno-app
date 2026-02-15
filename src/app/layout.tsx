import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer"
import Header from "../components/Header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fyno | Streaming Fest",
  description: "Fyno is a modern display for video platforms, OTT services, and entertainment brands. Fully customizable, SEO-optimized, and packed with reusable components—perfect for launching your next streaming project on TemplateMonster.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#141414]`}
      >
        <Header />
        {children}
        <Footer/>
      </body>
    </html>
  );
}
