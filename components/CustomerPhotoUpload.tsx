"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from 'next/image';

interface CustomerPhotoUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export function CustomerPhotoUpload({
  onFileSelect,
  acceptedFileTypes = ['image/*'],
  maxFileSize = 5 * 1024 * 1024 // 5MB
}: CustomerPhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Dosya boyutu kontrolü
      if (file.size > maxFileSize) {
        throw new Error(`Dosya boyutu ${maxFileSize / (1024 * 1024)}MB'dan büyük olamaz`);
      }

      // Dosya tipi kontrolü
      const isValidType = acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isValidType) {
        throw new Error('Geçersiz dosya tipi');
      }

      // Preview oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setSelectedFile(file);
      onFileSelect(file);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setError(error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu');
      onFileSelect(null);
    } finally {
      setIsLoading(false);
    }
  }, [acceptedFileTypes, maxFileSize, onFileSelect]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        await handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label>Fotoğraf</Label>
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
            <p className="text-sm text-gray-600">Fotoğraf yükleniyor...</p>
          </div>
        ) : selectedFile && preview ? (
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={preview}
                alt="Fotoğraf önizleme"
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <p>Boyut: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Tip: {selectedFile.type}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Fotoğrafı buraya bırakın"
                : "Fotoğraf yüklemek için tıklayın veya sürükleyin"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG dosyaları (max 5MB)
            </p>
          </div>
        )}
      </Card>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 