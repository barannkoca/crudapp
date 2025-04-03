"use client";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function page() {
  const { data: session } = useSession();

  console.log("Session data:", session); // Debug için session bilgisini yazdır

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Taraf - Kullanıcı Bilgileri */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User Profile"
                    width={160}
                    height={160}
                    className="rounded-full border-4 border-blue-100 shadow-lg"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full border-4 border-blue-100 shadow-lg bg-gray-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
              </div>

              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Hoş geldin, {session?.user?.name || "Kullanıcı"}!
                </h1>
                <p className="text-gray-600 text-lg">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sağ Taraf - Hızlı İşlemler */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hızlı İşlemler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/createform"
                className="group p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Yeni Kayıt</h3>
                  <p className="text-sm text-gray-600">Yeni bir kayıt oluştur</p>
                </div>
              </Link>

              <Link 
                href="/records"
                className="group p-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Kayıtlarım</h3>
                  <p className="text-sm text-gray-600">Tüm kayıtlarınızı görüntüle</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}