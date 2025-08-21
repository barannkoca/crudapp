"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FileText, Clock, AlertCircle } from 'lucide-react';

interface DigerIslemlerDetailsStepProps {
  onDataChange?: (data: any) => void;
  formData?: any;
}

export function DigerIslemlerDetailsStep({
  onDataChange,
  formData
}: DigerIslemlerDetailsStepProps) {
  const [details, setDetails] = useState({
    islem_adi: '',
    baslama_tarihi: '',
    bitis_tarihi: ''
  });

  useEffect(() => {
    if (formData?.detaylar) {
      setDetails(formData.detaylar);
    }
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onDataChange?.({ detaylar: newDetails });
  };



  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <FileText className="w-5 h-5" />
            İşlem Detayları
          </CardTitle>
          <CardDescription className="text-purple-600">
            Gerçekleştirilecek işlem adını girin
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* İşlem Adı */}
          <div className="space-y-2">
            <Label htmlFor="islem_adi" className="text-sm font-medium flex items-center gap-1">
              İşlem Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              id="islem_adi"
              value={details.islem_adi}
              onChange={(e) => handleChange('islem_adi', e.target.value)}
              placeholder="Örn: Vize Başvurusu, Evlilik Belgesi, Noter İşlemi vs."
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
            {!details.islem_adi && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                İşlem adı zorunludur
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Clock className="w-5 h-5" />
            Tarih Bilgileri
          </CardTitle>
          <CardDescription className="text-purple-600">
            İşlem tarihlerini belirtin (opsiyonel)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Başlama Tarihi */}
            <div className="space-y-2">
              <Label htmlFor="baslama_tarihi" className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Başlama Tarihi
              </Label>
              <Input
                id="baslama_tarihi"
                type="date"
                value={details.baslama_tarihi}
                onChange={(e) => handleChange('baslama_tarihi', e.target.value)}
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Tahmini Bitiş Tarihi */}
            <div className="space-y-2">
              <Label htmlFor="bitis_tarihi" className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Tahmini Bitiş Tarihi
              </Label>
              <Input
                id="bitis_tarihi"
                type="date"
                value={details.bitis_tarihi}
                onChange={(e) => handleChange('bitis_tarihi', e.target.value)}
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bilgi Notu */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-700">
            <p className="font-medium mb-1">Bilgi:</p>
            <p>
              Sadece işlem adı zorunludur. Tarihler opsiyoneldir. Detaylı açıklamalar ve 
              kategori bilgilerini sonraki adımda (Ücret & Açıklama) ekleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}