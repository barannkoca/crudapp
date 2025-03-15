"use client";
import { useSession } from "next-auth/react";

export default function page() {
  const { data: session } = useSession();

  return (
<div className="flex items-center justify-center min-h-screen flex-col text-center">
  <img
    src={session?.user?.image}
    alt="User Profile"
    className="w-30 h-30 rounded-full mb-4"  // resim ve yazı arasına boşluk ekledik
  />
  <h1 className="text-2xl font-semibold">
    Dashboarda hoş geldin {session?.user?.name}!
  </h1>
</div>
  );
}