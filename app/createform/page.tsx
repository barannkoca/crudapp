"use client"

import React from "react"
import { CreateRecordForm } from "@/components/createRecordForm"
import { motion } from "framer-motion"
import Link from "next/link"

/**
 * Üst seviye sayfa bileşeninde sadece layout ve form render'ı bulunuyor.
 * Böylece sayfayı daha kolay yönetebilir, test edebilir veya farklı formlar ekleyebilirsiniz.
 */
export default function CreateUserPage() {
  const [error, setError] = React.useState<string | null>(null);

  // Kullanıcı durumunu kontrol et
  React.useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/user/status');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
        }
      } catch (error) {
        console.error('Kullanıcı durumu kontrol edilirken hata oluştu:', error);
      }
    };

    checkUserStatus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Üst Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Geri Dön
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Kayıt Oluştur
                  </h1>
                  <p className="text-sm text-gray-600">
                    Lütfen tüm bilgileri eksiksiz doldurun
                  </p>
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-red-800">
                          {error}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form İçeriği */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <CreateRecordForm />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
