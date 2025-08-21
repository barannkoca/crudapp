"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, FileText, DollarSign, Upload } from 'lucide-react';
import { OpportunityFormWrapper } from '@/components/OpportunityFormWrapper';
import { CustomerSelectionStep } from '@/components/opportunity-steps/CustomerSelectionStep';
import { IkametIzniDetailsStep } from '@/components/opportunity-steps/IkametIzniDetailsStep';
import { PricingStep } from '@/components/opportunity-steps/PricingStep';
import { DocumentUploadStep } from '@/components/opportunity-steps/DocumentUploadStep';
import { IslemTuruDto } from '@/src/dto/opportunity.dto';

export default function IkametIzniCreatePage() {
  const router = useRouter();

  const steps = [
    {
      id: 'customer',
      title: 'Müşteri',
      description: 'Müşteri seçimi',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'details',
      title: 'İkamet Detayları',
      description: 'İkamet bilgileri',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'pricing',
      title: 'Ücret & Açıklama',
      description: 'Ücret ve notlar',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'documents',
      title: 'Belgeler',
      description: 'PDF yükleme',
      icon: <Upload className="w-5 h-5" />
    }
  ];

  const handleSubmit = async (formData: any) => {
    try {
      if (!formData.musteri_id) {
        toast.error('Lütfen bir müşteri seçin');
        return;
      }

      if (!formData.detaylar?.yapilan_islem || !formData.detaylar?.ikamet_turu || 
          !formData.detaylar?.kayit_tarihi || !formData.detaylar?.kayit_numarasi) {
        toast.error('Lütfen tüm zorunlu ikamet izni detaylarını doldurun');
        return;
      }

      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          musteri_id: formData.musteri_id,
          islem_turu: IslemTuruDto.IKAMET_IZNI,
          detaylar: formData.detaylar,
          aciklamalar: formData.aciklamalar || [],
          ucretler: formData.ucretler || [],
          pdf_dosyalari: formData.pdf_dosyalari || []
        }),
      });

      if (response.ok) {
        toast.success('İkamet izni fırsatı oluşturuldu!');
        router.push('/ikamet-izni');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Fırsat oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    }
  };

  const handleCancel = () => router.push('/ikamet-izni');

  return (
    <OpportunityFormWrapper
      title="Yeni İkamet İzni Fırsatı"
      islemTuru={IslemTuruDto.IKAMET_IZNI}
      steps={steps}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      backHref="/ikamet-izni"
    >
      <CustomerSelectionStep />
      <IkametIzniDetailsStep />
      <PricingStep />
      <DocumentUploadStep />
    </OpportunityFormWrapper>
  );
}