import React, { ReactNode } from "react";
import Provider from "@/components/provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <div className="flex h-screen w-full">
        <main className="flex-1 w-full overflow-auto">
          {children}
        </main>
      </div>
    </Provider>
  );
} 