"use client"

import React, { useRef, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface FileUploadFieldProps {
  form: UseFormReturn<any>    // veya UseFormReturn<UserRegistrationFormData>
  fieldName: string           // örn: "photo", "kayit_pdf", vs.
  label: string
  accept?: string             // "image/*, application/pdf" vb.
}

export function FileUploadField({
  form,
  fieldName,
  label,
  accept = "image/*,application/pdf",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // react-hook-form ile kayıtlı değeri izleyelim.
  // örn: "photo" alanında hangi dosya var?
  const fileValue = form.watch(fieldName)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    form.setValue(fieldName, file)

    if (file && file.type.includes("image")) {
      // Resim dosyası ise önizleme oluştur
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // PDF vs. için önizleme yerine sadece dosya adını gösterebiliriz
      setPreview(null)
    }
  }

  const removeFile = () => {
    form.setValue(fieldName, undefined)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    setPreview(null)
  }

  return (
    <FormItem className="flex flex-col gap-2">
      <FormLabel className="font-semibold text-gray-700">{label}</FormLabel>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
      />
      <FormMessage className="text-red-600 text-sm" />

      {fileValue && (
        <div className="mt-2 flex flex-col gap-1">
        {preview ? (
            <img
            src={preview}
            alt="Önizleme"
            className="mx-auto w-32 h-auto rounded-md border border-gray-300 mb-1"
            />
        ) : (
            <p className="text-xs text-gray-600">
            Seçilen dosya: {fileValue.name}
            </p>
        )}

        <button
            type="button"
            onClick={removeFile}
            className="text-red-500 text-sm underline hover:text-red-600"
        >
            Kaldır
        </button>
        </div>

      )}
    </FormItem>
  )
}
