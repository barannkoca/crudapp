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
