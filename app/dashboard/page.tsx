"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Corporate {
  _id: string;
  name: string;
  role: string;
}

export default function page() {
  const { data: session } = useSession();
  const [corporate, setCorporate] = useState<Corporate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusResponse = await fetch('/api/user/status');
        const statusData = await statusResponse.json();
        if (statusResponse.ok) {
          setUserStatus(statusData.status);
        }
      } catch (error) {
        console.error('Status alınamadı:', error);
      }
    };

    const fetchCorporates = async () => {
      try {
        setError(null); // Reset error state
        const response = await fetch('/api/corporates/user');
        const data = await response.json();
        
        if (response.ok) {
          setCorporate(data);
        } else {
          setError(data.error || 'Şirket bilgileri alınamadı');
        }
      } catch (error: any) {
        setError(error.message || 'Şirket bilgileri alınamadı');
      } finally {
        setLoading(false);
      }

      
    };

    if (session?.user?.id) {
      fetchData();
      fetchCorporates();
    }
  }, [session?.user?.id]);

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
                <p className="text-gray-600 text-lg">
                  hesap durumu: {userStatus}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Şirket Bilgisi veya Uyarı */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {!loading && !corporate ? (
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Şirket Kaydı Gerekli</h3>
                      <p className="text-sm text-red-700 mt-1">Kayıt oluşturmak için bir şirket oluşturmanız veya bir şirkete üye olmanız gerekiyor.</p>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href="/corporate/create"
                  className="block w-full bg-red-100 hover:bg-red-200 text-red-800 font-semibold p-4 rounded-xl text-center transition-colors duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Şirket Oluştur</span>
                  </div>
                </Link>
              </div>
            ) : !loading && corporate && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Şirket Bilgileri</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{corporate.name}</h3>
                    <p className="text-sm text-gray-600">Rol: {corporate.role.charAt(0).toUpperCase() + corporate.role.slice(1)}</p>
                  </div>
                </div>
              </div>
            )}
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
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Kayıt Oluştur</h3>
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}