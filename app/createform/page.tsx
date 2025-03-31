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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[80vh] flex flex-col items-center justify-center py-12"
    >
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-8 sm:px-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Kayıt Oluştur
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Lütfen tüm bilgileri eksiksiz doldurun.
                </p>
              </div>
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Geri Dön
              </Link>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CreateRecordForm />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
