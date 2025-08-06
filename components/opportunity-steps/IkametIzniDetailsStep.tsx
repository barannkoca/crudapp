"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { ISLEMLER, IKAMET_TURU } from '@/src/constants';

interface IkametIzniDetailsStepProps {
  onDataChange?: (data: any) => void;
  formData?: any;
}

export const IkametIzniDetailsStep: React.FC<IkametIzniDetailsStepProps> = ({
  onDataChange,
  formData
}) => {
  const [details, setDetails] = useState({
    yapilan_islem: '',
    ikamet_turu: '',
    kayit_tarihi: '',
    kayit_numarasi: '',
    gecerlilik_tarihi: '',
    randevu_tarihi: ''
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

  const yapilanIslemler = ISLEMLER;
  const ikametTurleri = IKAMET_TURU;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Yapılan İşlem */}
      <div>
        <Label htmlFor="yapilan_islem" className="text-sm font-medium">
          Yapılan İşlem *
        </Label>
        <Select value={details.yapilan_islem} onValueChange={(value) => handleChange('yapilan_islem', value)}>
          <SelectTrigger className="mt-1 h-9">
            <SelectValue placeholder="İşlem türü seçin..." />
          </SelectTrigger>
          <SelectContent>
            {yapilanIslemler.map((islem) => (
              <SelectItem key={islem} value={islem}>
                {islem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* İkamet Türü */}
      <div>
        <Label htmlFor="ikamet_turu" className="text-sm font-medium">
          İkamet Türü *
        </Label>
        <Select value={details.ikamet_turu} onValueChange={(value) => handleChange('ikamet_turu', value)}>
          <SelectTrigger className="mt-1 h-9">
            <SelectValue placeholder="İkamet türü seçin..." />
          </SelectTrigger>
          <SelectContent>
            {ikametTurleri.map((tur) => (
              <SelectItem key={tur} value={tur}>
                {tur}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kayıt Numarası */}
      <div>
        <Label htmlFor="kayit_numarasi" className="text-sm font-medium">
          Kayıt Numarası *
        </Label>
        <Input
          id="kayit_numarasi"
          value={details.kayit_numarasi}
          onChange={(e) => handleChange('kayit_numarasi', e.target.value)}
          placeholder="Kayıt numarası..."
          className="mt-1 h-9"
        />
      </div>

      {/* Kayıt Tarihi */}
      <div>
        <Label htmlFor="kayit_tarihi" className="text-sm font-medium">
          Kayıt Tarihi *
        </Label>
        <Input
          id="kayit_tarihi"
          type="date"
          value={details.kayit_tarihi}
          onChange={(e) => handleChange('kayit_tarihi', e.target.value)}
          className="mt-1 h-9"
        />
      </div>

      {/* Geçerlilik Tarihi */}
      <div>
        <Label htmlFor="gecerlilik_tarihi" className="text-sm font-medium">
          Geçerlilik Tarihi
        </Label>
        <Input
          id="gecerlilik_tarihi"
          type="date"
          value={details.gecerlilik_tarihi}
          onChange={(e) => handleChange('gecerlilik_tarihi', e.target.value)}
          className="mt-1 h-9"
        />
      </div>

      {/* Randevu Tarihi */}
      <div>
        <Label htmlFor="randevu_tarihi" className="text-sm font-medium">
          Randevu Tarihi
        </Label>
        <Input
          id="randevu_tarihi"
          type="date"
          value={details.randevu_tarihi}
          onChange={(e) => handleChange('randevu_tarihi', e.target.value)}
          className="mt-1 h-9"
        />
        <p className="text-xs text-gray-500 mt-1">
          Açıklamalar için "Ücret & Açıklama" adımını kullanın.
        </p>
      </div>
    </div>
  );
};