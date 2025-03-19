"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function page() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Session yükleniyorsa bekle
    if (session) {
      redirect("/dashboard");
    } else {
      redirect("/auth/signin");
    }
  }, [session, status]);

  return <p className="flex items-center justify-center min-h-screen flex-col text-center text-2xl font-semibold">Yükleniyor...</p>;
}