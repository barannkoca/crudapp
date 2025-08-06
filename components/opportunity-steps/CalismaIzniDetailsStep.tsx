"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';
import { CALISMA_IZNI_SOZLESME_TURLERI } from '@/src/constants';

interface CalismaIzniDetailsStepProps {
  onDataChange?: (data: any) => void;
  formData?: any;
}

export const CalismaIzniDetailsStep: React.FC<CalismaIzniDetailsStepProps> = ({
  onDataChange,
  formData
}) => {
  const [details, setDetails] = useState({
    isveren: '',
    pozisyon: '',
    sozlesme_turu: '',
    maas: '',
    calisma_saati: ''
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

  const sozlesmeTurleri = CALISMA_IZNI_SOZLESME_TURLERI;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* İşveren */}
      <div>
        <Label htmlFor="isveren" className="text-sm font-medium">
          İşveren Adı *
        </Label>
        <Input
          id="isveren"
          value={details.isveren}
          onChange={(e) => handleChange('isveren', e.target.value)}
          placeholder="İşveren şirket adı..."
          className="mt-1 h-9"
        />
      </div>

      {/* Pozisyon */}
      <div>
        <Label htmlFor="pozisyon" className="text-sm font-medium">
          Pozisyon *
        </Label>
        <Input
          id="pozisyon"
          value={details.pozisyon}
          onChange={(e) => handleChange('pozisyon', e.target.value)}
          placeholder="Çalışılacak pozisyon..."
          className="mt-1 h-9"
        />
      </div>

      {/* Sözleşme Türü */}
      <div>
        <Label htmlFor="sozlesme_turu" className="text-sm font-medium">
          Sözleşme Türü *
        </Label>
        <Select value={details.sozlesme_turu} onValueChange={(value) => handleChange('sozlesme_turu', value)}>
          <SelectTrigger className="mt-1 h-9">
            <SelectValue placeholder="Sözleşme türü seçin..." />
          </SelectTrigger>
          <SelectContent>
            {sozlesmeTurleri.map((tur) => (
              <SelectItem key={tur} value={tur}>
                {tur}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Maaş */}
      <div>
        <Label htmlFor="maas" className="text-sm font-medium">
          Maaş (TL) *
        </Label>
        <Input
          id="maas"
          type="number"
          value={details.maas}
          onChange={(e) => handleChange('maas', e.target.value)}
          placeholder="Aylık maaş..."
          className="mt-1 h-9"
          min="0"
          step="0.01"
        />
      </div>

      {/* Çalışma Saati */}
      <div className="md:col-span-2">
        <Label htmlFor="calisma_saati" className="text-sm font-medium">
          Haftalık Çalışma Saati *
        </Label>
        <Input
          id="calisma_saati"
          type="number"
          value={details.calisma_saati}
          onChange={(e) => handleChange('calisma_saati', e.target.value)}
          placeholder="Haftalık çalışma saati..."
          className="mt-1 h-9"
          min="1"
          max="168"
        />
        <p className="text-xs text-gray-500 mt-1">
          1-168 saat arası
        </p>
      </div>
    </div>
  );
};