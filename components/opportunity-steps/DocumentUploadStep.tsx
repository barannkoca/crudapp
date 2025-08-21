"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileUploadField } from '@/components/fields/FileUploadField';
import { FileText, Upload, X, Plus } from 'lucide-react';
import { PdfDosyaDto } from '@/src/dto/opportunity.dto';

interface DocumentUploadStepProps {
  onDataChange?: (data: { pdf_dosyalari?: PdfDosyaDto[] }) => void;
  formData?: any;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  onDataChange,
  formData
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<PdfDosyaDto[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (formData?.pdf_dosyalari && Array.isArray(formData.pdf_dosyalari)) {
      setUploadedFiles(formData.pdf_dosyalari);
    } else if (formData?.pdf_dosya) {
      // Eski format desteği
      setUploadedFiles([formData.pdf_dosya]);
    }
  }, [formData]);

  const addFile = (file: PdfDosyaDto) => {
    const newFiles = [...uploadedFiles, {
      ...file,
      dosya_adi: (file as any).filename || `PDF ${uploadedFiles.length + 1}`,
      dosya_boyutu: (file as any).size || 0,
      yuklenme_tarihi: new Date()
    }];
    setUploadedFiles(newFiles);
    onDataChange?.({ pdf_dosyalari: newFiles });
    setShowAddForm(false);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onDataChange?.({ pdf_dosyalari: newFiles });
  };

  const handleFileUpload = (file: PdfDosyaDto | null) => {
    if (file) {
      addFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          PDF Belgeleri (Opsiyonel)
        </Label>
        <p className="text-xs text-gray-500 mb-3">
          İşlemle ilgili PDF belgelerini yükleyebilirsiniz. Birden fazla dosya ekleyebilirsiniz.
        </p>
      </div>

      {/* Yüklenen Dosyalar Listesi */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">
            Yüklenen Dosyalar ({uploadedFiles.length})
          </Label>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-900 text-sm">
                      {file.dosya_adi || `PDF ${index + 1}`}
                    </p>
                    <p className="text-xs text-green-700">
                      Boyut: {file.dosya_boyutu ? 
                        (file.dosya_boyutu / 1024 / 1024).toFixed(2) + ' MB' : 
                        (file.data.length * 3/4 / 1024 / 1024).toFixed(2) + ' MB'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dosya Ekleme Butonu */}
      {!showAddForm && (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed border-2 h-20 flex flex-col gap-2 text-gray-600 hover:text-gray-800 hover:border-gray-400"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">PDF Dosyası Ekle</span>
        </Button>
      )}

      {/* Dosya Yükleme Formu */}
      {showAddForm && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Yeni PDF Dosyası</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <FileUploadField
            onFileSelect={handleFileUpload}
            selectedFile={null}
            accept=".pdf"
            maxSizeMB={10}
            placeholder="PDF dosyası seçin..."
          />
        </div>
      )}

      {/* Kurallar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <Upload className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Kurallar</h4>
            <ul className="text-xs text-blue-700 mt-1 space-y-0.5">
              <li>• Her dosya max 10 MB, sadece PDF formatı</li>
              <li>• Birden fazla dosya yükleyebilirsiniz</li>
              <li>• Zorunlu değil, güvenle saklanır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};