"use client";

import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";

export default function page() {
  return (
<div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        {/* Başlık */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Giriş Yap</h2>

        {/* Giriş Formu */}
        <form className="mt-6">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="E-posta"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <input
              type="password"
              placeholder="Şifre"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              Giriş Yap
            </button>
          </div>
        </form>

        {/* Alternatif Giriş */}
        <div className="mt-4 flex space-x-4 justify-center space-y-2">
          {/* Google butonu */}
          <button className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition"
                  onClick={() => signIn("google", {callbackUrl: "/dashboard"})}>
            <FcGoogle className="h-6 w-6" />
          </button>

          {/* GitHub butonu */}
          <button className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition"
                  /*onClick={() => signIn("github")}*/>
            <FaGithub className="h-6 w-6" />
          </button>
        </div>

        {/* Kayıt Linki */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-gray-900 hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}