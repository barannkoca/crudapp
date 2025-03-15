"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function page() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/auth/signin");
    return null;
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold">Hoş geldin!</h1>
    </div>
  );
}