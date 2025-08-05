"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth') || 
                     pathname?.startsWith('/signin') || 
                     pathname?.startsWith('/signup') || 
                     pathname?.startsWith('/register');

  if (isAuthPage) {
    return (
      <div className="flex h-screen">
        <main className="flex-1 w-full overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <main className="flex-1 w-full overflow-auto">
        {children}
      </main>
    </div>
  );
} 