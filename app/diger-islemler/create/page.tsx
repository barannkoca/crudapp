"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, FileText, DollarSign, Upload, ClipboardList } from 'lucide-react';
import { OpportunityFormWrapper } from '@/components/OpportunityFormWrapper';
import { CustomerSelectionStep } from '@/components/opportunity-steps/CustomerSelectionStep';
import { DigerIslemlerDetailsStep } from '@/components/opportunity-steps/DigerIslemlerDetailsStep';
import { PricingStep } from '@/components/opportunity-steps/PricingStep';
import { DocumentUploadStep } from '@/components/opportunity-steps/DocumentUploadStep';
import { IslemTuruDto } from '@/src/dto/opportunity.dto';

export default function DigerIslemlerCreatePage() {
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
      title: 'İşlem Detayları',
      description: 'İşlem bilgileri',
      icon: <ClipboardList className="w-5 h-5" />
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
      // Form validasyonu
      if (!formData.musteri_id) {
        toast.error('Lütfen bir müşteri seçin');
        return;
      }

      if (!formData.detaylar?.islem_adi) {
        toast.error('Lütfen işlem adını girin');
        return;
      }

      // API'ye gönder
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          musteri_id: formData.musteri_id,
          islem_turu: IslemTuruDto.DIGER,
          detaylar: {
            islem_adi: formData.detaylar.islem_adi,
            baslama_tarihi: formData.detaylar.baslama_tarihi ? new Date(formData.detaylar.baslama_tarihi) : undefined,
            bitis_tarihi: formData.detaylar.bitis_tarihi ? new Date(formData.detaylar.bitis_tarihi) : undefined
          },
          aciklamalar: formData.aciklamalar || [],
          ucretler: formData.ucretler || [],
          pdf_dosya: formData.pdf_dosya
        }),
      });

      if (response.ok) {
        toast.success('İşlem başarıyla oluşturuldu!');
        router.push('/diger-islemler');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'İşlem oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    }
  };

  const handleCancel = () => {
    router.push('/diger-islemler');
  };

  return (
    <OpportunityFormWrapper
      title="Yeni Diğer İşlem"
      islemTuru={IslemTuruDto.DIGER}
      steps={steps}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      backHref="/diger-islemler"
    >
      <CustomerSelectionStep />
      <DigerIslemlerDetailsStep />
      <PricingStep />
      <DocumentUploadStep />
    </OpportunityFormWrapper>
  );
}