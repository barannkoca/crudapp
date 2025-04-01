"use client"

import React, { useCallback, useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"
import Image from 'next/image'
import { FileService, FileInfo } from "@/services/fileService"

interface FileUploadFieldProps {
  form: UseFormReturn<any>
  fieldName: string
  label: string
  accept?: string
  onFileSelect?: (file: File) => void
}

export function FileUploadField({
  form,
  fieldName,
  label,
  accept = "image/*,application/pdf",
  onFileSelect,
}: FileUploadFieldProps) {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setStatus(null)
    
    try {
      const info = await FileService.processFile(file)
      setFileInfo(info)
      form.setValue(fieldName, file)
      
      if (file.type === "application/pdf") {
        setStatus("PDF başarıyla yüklendi!")
      } else if (file.type.startsWith('image/')) {
        setStatus("Resim başarıyla yüklendi!")
      } else {
        setStatus("Dosya başarıyla yüklendi!")
      }
      
      if (onFileSelect) {
        onFileSelect(file)
      }
    } catch (error) {
      console.error('Dosya işleme hatası:', error)
      setError('Dosya işlenirken bir hata oluştu. Lütfen tekrar deneyin.')
      form.setValue(fieldName, file)
    } finally {
      setIsLoading(false)
    }
  }, [form, fieldName, onFileSelect])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (file.type === "application/pdf") {
          setStatus("PDF yükleniyor...")
        } else if (file.type.startsWith('image/')) {
          setStatus("Resim yükleniyor...")
        }
        await handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles: 1,
  })

  const file = form.watch(fieldName)

  const removeFile = () => {
    form.setValue(fieldName, undefined)
    if (fileInfo?.preview) {
      FileService.revokePreview(fileInfo.preview)
    }
    setFileInfo(null)
    setError(null)
    setStatus(null)
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">{status || "Dosya işleniyor..."}</p>
          </div>
        ) : fileInfo ? (
          <div className="space-y-4">
            {fileInfo.preview ? (
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src={fileInfo.preview}
                  alt="Önizleme"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                {fileInfo.type === "application/pdf" ? (
                  <FileText className="h-12 w-12 text-gray-400" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{fileInfo.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <p>Boyut: {fileInfo.size}</p>
                <p>Tip: {fileInfo.type}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Dosyayı buraya bırakın"
                : "Dosya yüklemek için tıklayın veya sürükleyin"}
            </p>
            <p className="text-xs text-gray-500">
              PDF veya resim dosyası yükleyebilirsiniz
            </p>
          </div>
        )}
      </Card>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
      {status && !error && (
        <div className="flex items-center gap-2 text-sm text-green-500 mt-2">
          <CheckCircle2 className="h-4 w-4" />
          <p>{status}</p>
        </div>
      )}
    </div>
  )
}
