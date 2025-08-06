"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileUploadField } from '@/components/fields/FileUploadField';
import { FileText, Upload } from 'lucide-react';
import { PdfDosyaDto } from '@/src/dto/opportunity.dto';

interface DocumentUploadStepProps {
  onDataChange?: (data: { pdf_dosya?: PdfDosyaDto }) => void;
  formData?: any;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  onDataChange,
  formData
}) => {
  const [uploadedFile, setUploadedFile] = useState<PdfDosyaDto | null>(null);

  useEffect(() => {
    if (formData?.pdf_dosya) {
      setUploadedFile(formData.pdf_dosya);
    }
  }, [formData]);

  const handleFileUpload = (file: PdfDosyaDto | null) => {
    setUploadedFile(file);
    onDataChange?.({ pdf_dosya: file || undefined });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          PDF Belgesi (Opsiyonel)
        </Label>
        <p className="text-xs text-gray-500 mb-2">
          İşlemle ilgili PDF belgelerini yükleyebilirsiniz.
        </p>
        
        <FileUploadField
          onFileSelect={handleFileUpload}
          selectedFile={uploadedFile}
          accept=".pdf"
          maxSizeMB={10}
          placeholder="PDF dosyası seçin..."
        />
      </div>

      {uploadedFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-900 text-sm">PDF Belgesi Yüklendi</p>
              <p className="text-xs text-green-700">
                Boyut: {(uploadedFile.data.length * 3/4 / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <Upload className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Kurallar</h4>
            <ul className="text-xs text-blue-700 mt-1 space-y-0.5">
              <li>• Max 10 MB, sadece PDF</li>
              <li>• Zorunlu değil, güvenle saklanır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};