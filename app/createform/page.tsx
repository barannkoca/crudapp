"use client"

import React from "react"
import { CreateRecordForm } from "@/components/createRecordForm"

/**
 * Üst seviye sayfa bileşeninde sadece layout ve form render’ı bulunuyor.
 * Böylece sayfayı daha kolay yönetebilir, test edebilir veya farklı formlar ekleyebilirsiniz.
 */
export default function CreateUserPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 py-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Kayıt Oluştur</h1>
      <p className="text-gray-500 mb-8 text-center">
        Lütfen tüm bilgileri eksiksiz doldurun.
      </p>
      
      <CreateRecordForm />
    </div>
  )
}
