import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React, { ReactNode } from "react"; // React ve ReactNode import edildi
import Navbar from "@/components/navbar";
import "./globals.css";
import Provider from "@/components/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrudApp",
  description: "Simple Project for my Portfolio",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="antialiased">
        <Provider>
          <Navbar /> {/* Navbar bileşeni */}
          <main className="container mx-auto p-4">{children}</main>
        </Provider>
      </body>
    </html>
  );
}
