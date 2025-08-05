import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React, { ReactNode } from "react";
import "./globals.css";
import Provider from "@/components/provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import LayoutContent from "@/components/LayoutContent";

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
      <body className="antialiased h-screen overflow-hidden">
        <Provider>
          <SidebarProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </SidebarProvider>
        </Provider>
      </body>
    </html>
  );
}
