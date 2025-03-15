"use client";
import Link from "next/link";
import Image from 'next/image'
import {useState, useEffect} from'react';
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    const handleLogout = () => {
        console.log("Çıkış yapıldı");
        signOut({callbackUrl: "/"});
      };
      
    console.log(session);
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
      <Link href="/" className="flex items-center">
            <Image
            src="/file.svg"
            width={30}
            height={30}
            alt=""
            />
            <p className="text-black text-lg font-semibold tracking-wide px-3">CrudApp</p>
        </Link>

        {/* Menü */}
        <div>
            {session ? (
                <div className="space-x-6">
                    <Link href="/" className="text-gray-900 hover:text-gray-600 hover:underline hover:underline-offset-4 transition">Kayıt Oluştur</Link>
                    <Link href="/products" className="text-gray-900 hover:text-gray-600 hover:underline hover:underline-offset-4 transition">Kayıtları Gör</Link>
                    <button onClick={handleLogout} className="rounded-full border border-solid border-transparent transition-colors items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] h-10 sm:px-5 sm:w-auto">
                    Çıkış Yap
                    </button>
                    
                </div>
            ):(
                <>
                </>
            )}
        </div>
      </div>
    </nav>
  );
}