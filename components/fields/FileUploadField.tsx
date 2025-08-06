"use client"

import React, { useCallback, useState } from "react"
import { UseFormReturn, Controller } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"

interface FileUploadFieldProps {
  // Form-based props (optional)
  form?: UseFormReturn<any>
  fieldName?: string
  label?: string
  
  // Standalone props (optional)
  onFileSelect?: (file: any) => void
  selectedFile?: any
  
  // Common props
  accept?: string
  maxSizeMB?: number
  placeholder?: string
}

export function FileUploadField({
  form,
  fieldName,
  label,
  accept = "image/*,application/pdf",
  onFileSelect,
  selectedFile,
  maxSizeMB = 10,
  placeholder = "Dosya seçin..."
}: FileUploadFieldProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)
      setStatus("Dosya işleniyor...")

      // File size check
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz`)
      }

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const fileData = {
        data: base64.split(',')[1], // Remove data:image/...;base64, prefix
        contentType: file.type,
        filename: file.name,
        size: file.size
      }

      // Form-based usage
      if (form && fieldName) {
        form.setValue(fieldName, fileData)
      }

      // Standalone usage
      if (onFileSelect) {
        onFileSelect(fileData)
      }

      setStatus("Dosya başarıyla yüklendi!")
    } catch (error: any) {
      setError(error.message || "Dosya yüklenirken hata oluştu")
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus(null), 2000)
    }
  }, [form, fieldName, onFileSelect, maxSizeMB])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0])
      }
    },
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
  })

  const removeFile = () => {
    if (form && fieldName) {
      form.setValue(fieldName, undefined)
    }
    if (onFileSelect) {
      onFileSelect(null)
    }
    setError(null)
    setStatus(null)
  }

  // Form-based render
  if (form && fieldName) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Controller
          name={fieldName}
          control={form.control}
          render={({ field }) => (
            <FileUploadContent
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              isLoading={isLoading}
              status={status}
              error={error}
              file={field.value}
              placeholder={placeholder}
              onRemove={removeFile}
            />
          )}
        />
      </div>
    )
  }

  // Standalone render
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <FileUploadContent
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        isLoading={isLoading}
        status={status}
        error={error}
        file={selectedFile}
        placeholder={placeholder}
        onRemove={removeFile}
      />
    </div>
  )
}

// Reusable content component
function FileUploadContent({
  getRootProps,
  getInputProps,
  isDragActive,
  isLoading,
  status,
  error,
  file,
  placeholder,
  onRemove
}: {
  getRootProps: any
  getInputProps: any
  isDragActive: boolean
  isLoading: boolean
  status: string | null
  error: string | null
  file: any
  placeholder: string
  onRemove: () => void
}) {
  return (
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
      ) : file ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            {file.contentType === "application/pdf" ? (
              <FileText className="h-12 w-12 text-gray-400" />
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {file.filename || "Uploaded file"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {file.size && (
              <p className="text-xs text-gray-500">
                Boyut: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Yüklendi</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{placeholder}</p>
            <p className="text-xs text-gray-500">
              Dosyayı buraya sürükleyin veya tıklayarak seçin
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center justify-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {status && !isLoading && (
        <div className="mt-4 flex items-center justify-center text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span className="text-xs">{status}</span>
        </div>
      )}
    </Card>
  )
}