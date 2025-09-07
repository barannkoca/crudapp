"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase } from 'lucide-react';

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
    kayit_tarihi: '',
    calisma_izni_bitis_tarihi: ''
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

      {/* Çalışma İzni Bitiş Tarihi */}
      <div>
        <Label htmlFor="calisma_izni_bitis_tarihi" className="text-sm font-medium">
          Çalışma İzni Bitiş Tarihi *
        </Label>
        <Input
          id="calisma_izni_bitis_tarihi"
          type="date"
          value={details.calisma_izni_bitis_tarihi}
          onChange={(e) => handleChange('calisma_izni_bitis_tarihi', e.target.value)}
          className="mt-1 h-9"
        />
      </div>
    </div>
  );
};