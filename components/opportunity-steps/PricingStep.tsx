"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { UcretDto, ParaBirimiDto } from '@/src/dto/opportunity.dto';

interface PricingStepProps {
  onDataChange?: (data: { ucretler: UcretDto[]; aciklamalar: any[] }) => void;
  formData?: any;
}

export const PricingStep: React.FC<PricingStepProps> = ({
  onDataChange,
  formData
}) => {
  const [ucretler, setUcretler] = useState<UcretDto[]>([]);
  const [aciklama, setAciklama] = useState('');

  useEffect(() => {
    if (formData?.ucretler) {
      setUcretler(formData.ucretler);
    }
    if (formData?.aciklama) {
      setAciklama(formData.aciklama);
    }
  }, [formData]);

  const addUcret = () => {
    const newUcret: UcretDto = {
      miktar: 0,
      para_birimi: ParaBirimiDto.TRY,
      aciklama: '',
      odeme_durumu: 'beklemede'
    };
    const newUcretler = [...ucretler, newUcret];
    setUcretler(newUcretler);
    updateData(newUcretler);
  };

  const removeUcret = (index: number) => {
    const newUcretler = ucretler.filter((_, i) => i !== index);
    setUcretler(newUcretler);
    updateData(newUcretler);
  };

  const updateUcret = (index: number, field: keyof UcretDto, value: any) => {
    const newUcretler = ucretler.map((ucret, i) => 
      i === index ? { ...ucret, [field]: value } : ucret
    );
    setUcretler(newUcretler);
    updateData(newUcretler);
  };

  const updateData = (ucretlerData: UcretDto[]) => {
    const aciklamalar = aciklama ? [{
      baslik: 'Genel Açıklama',
      icerik: aciklama,
      tarih: new Date(),
      onem_derecesi: 'orta' as const
    }] : [];

    onDataChange?.({
      ucretler: ucretlerData,
      aciklamalar
    });
  };

  const handleAciklamaChange = (value: string) => {
    setAciklama(value);
    const aciklamalar = value ? [{
      baslik: 'Genel Açıklama',
      icerik: value,
      tarih: new Date(),
      onem_derecesi: 'orta' as const
    }] : [];

    onDataChange?.({
      ucretler,
      aciklamalar
    });
  };

  return (
    <div className="space-y-4">
      {/* Ücretler */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Ücret Bilgileri
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addUcret}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="w-3 h-3" />
            Ekle
          </Button>
        </div>

        <div className="space-y-3">
          {ucretler.map((ucret, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Miktar ve Para Birimi */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs font-medium">Miktar *</Label>
                    <Input
                      type="number"
                      value={ucret.miktar}
                      onChange={(e) => updateUcret(index, 'miktar', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="mt-1 h-8 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs font-medium">Para</Label>
                    <Select 
                      value={ucret.para_birimi} 
                      onValueChange={(value) => updateUcret(index, 'para_birimi', value as ParaBirimiDto)}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ParaBirimiDto.TRY}>TRY</SelectItem>
                        <SelectItem value={ParaBirimiDto.USD}>USD</SelectItem>
                        <SelectItem value={ParaBirimiDto.EUR}>EUR</SelectItem>
                        <SelectItem value={ParaBirimiDto.GBP}>GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ödeme Durumu */}
                <div>
                  <Label className="text-xs font-medium">Ödeme Durumu</Label>
                  <Select 
                    value={ucret.odeme_durumu} 
                    onValueChange={(value) => updateUcret(index, 'odeme_durumu', value)}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beklemede">Beklemede</SelectItem>
                      <SelectItem value="odendi">Ödendi</SelectItem>
                      <SelectItem value="iptal_edildi">İptal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Açıklama ve Sil */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs font-medium">Açıklama</Label>
                    <Input
                      value={ucret.aciklama || ''}
                      onChange={(e) => updateUcret(index, 'aciklama', e.target.value)}
                      placeholder="Ücret açıklaması..."
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeUcret(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Genel Açıklama */}
      <div>
        <Label htmlFor="aciklama" className="text-sm font-medium">
          Genel Açıklama
        </Label>
        <Textarea
          id="aciklama"
          value={aciklama}
          onChange={(e) => handleAciklamaChange(e.target.value)}
          placeholder="İşlemle ilgili genel açıklamalar..."
          className="mt-1"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          İşlemle ilgili önemli notları buraya yazabilirsiniz.
        </p>
      </div>
    </div>
  );
};