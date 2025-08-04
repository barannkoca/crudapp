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

export default function DashboardPage() {
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
        setError(null);
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
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Üst Bar */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Dashboard
                    </h1>
                    <p className="text-sm text-gray-600">
                      Hoş geldin, {session?.user?.name || "Kullanıcı"}!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* İçerik */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sol Taraf - Kullanıcı Bilgileri */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User Profile"
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-cyan-100 shadow-md"
                      />
                    ) : (
                      <div className="w-30 h-30 rounded-full border-4 border-cyan-100 shadow-md bg-gray-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-cyan-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Hoş geldin, {session?.user?.name || "Kullanıcı"}!
                    </h1>
                    <p className="text-gray-600">
                      {userStatus === 'active' ? 'Hesabınız aktif' : 'Hesabınız bekliyor'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Sağ Taraf - Hızlı Erişim */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    href="/ikamet-izni/create"
                    className="group p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">İkamet İzni</h3>
                      <p className="text-xs text-gray-600">Yeni kayıt oluştur</p>
                    </div>
                  </Link>

                  <Link 
                    href="/ikamet-izni"
                    className="group p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">İkamet İzni</h3>
                      <p className="text-xs text-gray-600">İkamet izni kayıtları</p>
                    </div>
                  </Link>

                  <Link 
                    href="/customers/create"
                    className="group p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Müşteri Ekle</h3>
                      <p className="text-xs text-gray-600">Yeni müşteri oluştur</p>
                    </div>
                  </Link>

                  <Link 
                    href="/customers"
                    className="group p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2 bg-cyan-100 rounded-full group-hover:bg-cyan-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Müşteriler</h3>
                      <p className="text-xs text-gray-600">Tüm müşterileri görüntüle</p>
                    </div>
                  </Link>
                </div>
              </motion.div>

              {/* Şirket Bilgisi veya Uyarı */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}