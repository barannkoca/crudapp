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
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Provider>
          <div className="flex flex-col min-h-screen">
            <Navbar /> {/* Navbar bileşeni */}
            <main className="flex-grow container mx-auto px-4 py-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <div className="container mx-auto px-4 py-6">
                <p className="text-center text-gray-600 text-sm">
                  © 2024 CrudApp. Tüm hakları saklıdır.
                </p>
              </div>
            </footer>
          </div>
        </Provider>
      </body>
    </html>
  );
}
