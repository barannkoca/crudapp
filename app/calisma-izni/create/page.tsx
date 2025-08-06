"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, Briefcase, DollarSign, FileText } from 'lucide-react';
import { OpportunityFormWrapper } from '@/components/OpportunityFormWrapper';
import { CustomerSelectionStep } from '@/components/opportunity-steps/CustomerSelectionStep';
import { CalismaIzniDetailsStep } from '@/components/opportunity-steps/CalismaIzniDetailsStep';
import { PricingStep } from '@/components/opportunity-steps/PricingStep';
import { DocumentUploadStep } from '@/components/opportunity-steps/DocumentUploadStep';
import { IslemTuruDto } from '@/src/dto/opportunity.dto';

export default function CalismaIzniCreatePage() {
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
      title: 'İş Detayları',
      description: 'Çalışma bilgileri',
      icon: <Briefcase className="w-5 h-5" />
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
      icon: <FileText className="w-5 h-5" />
    }
  ];

  const handleSubmit = async (formData: any) => {
    try {
      // Form validasyonu
      if (!formData.musteri_id) {
        toast.error('Lütfen bir müşteri seçin');
        return;
      }

      if (!formData.detaylar?.isveren || !formData.detaylar?.pozisyon || 
          !formData.detaylar?.sozlesme_turu || !formData.detaylar?.maas || 
          !formData.detaylar?.calisma_saati) {
        toast.error('Lütfen tüm çalışma izni detaylarını doldurun');
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
          islem_turu: IslemTuruDto.CALISMA_IZNI,
          detaylar: {
            isveren: formData.detaylar.isveren,
            pozisyon: formData.detaylar.pozisyon,
            sozlesme_turu: formData.detaylar.sozlesme_turu,
            maas: parseFloat(formData.detaylar.maas),
            calisma_saati: parseInt(formData.detaylar.calisma_saati)
          },
          aciklamalar: formData.aciklamalar || [],
          ucretler: formData.ucretler || [],
          pdf_dosya: formData.pdf_dosya
        }),
      });

      if (response.ok) {
        toast.success('Çalışma izni fırsatı başarıyla oluşturuldu!');
        router.push('/calisma-izni');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Fırsat oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    }
  };

  const handleCancel = () => {
    router.push('/calisma-izni');
  };

  return (
    <OpportunityFormWrapper
      title="Yeni Çalışma İzni Fırsatı"
      islemTuru={IslemTuruDto.CALISMA_IZNI}
      steps={steps}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      backHref="/calisma-izni"
    >
      <CustomerSelectionStep />
      <CalismaIzniDetailsStep />
      <PricingStep />
      <DocumentUploadStep />
    </OpportunityFormWrapper>
  );
}