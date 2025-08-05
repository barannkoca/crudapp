"use client"

import React, { useRef } from "react"
import { CreateRecordForm, CreateRecordFormRef } from "@/components/createRecordForm"
import OpportunityFormWrapper from "@/components/OpportunityFormWrapper"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CreateIkametIzniPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<{[key: string]: string}>({});
  const [touched, setTouched] = React.useState<{[key: string]: boolean}>({});
  const createRecordFormRef = useRef<CreateRecordFormRef>(null);
  const router = useRouter();

  React.useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/user/status');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
        }
      } catch (error) {
        console.error('Kullanıcı durumu kontrol edilirken hata oluştu:', error);
      }
    };
    checkUserStatus();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    const newTouched: {[key: string]: boolean} = {};
    
    // Müşteri seçimi kontrolü
    const selectedCustomer = createRecordFormRef.current?.getSelectedCustomer();
    if (!selectedCustomer) {
      newErrors.customer = "Lütfen bir müşteri seçin";
      newTouched.customer = true;
    }

    // Form değerlerini kontrol et
    const formValues = createRecordFormRef.current?.getFormValues();
    if (formValues) {
      // Zorunlu alanları kontrol et
      if (!formValues.kayit_ili) {
        newErrors.kayit_ili = "Kayıt ili seçimi zorunludur";
        newTouched.kayit_ili = true;
      }
      
      if (!formValues.yapilan_islem) {
        newErrors.yapilan_islem = "Yapılan işlem seçimi zorunludur";
        newTouched.yapilan_islem = true;
      }
      
      if (!formValues.ikamet_turu) {
        newErrors.ikamet_turu = "İkamet türü seçimi zorunludur";
        newTouched.ikamet_turu = true;
      }
      
      if (!formValues.kayit_tarihi) {
        newErrors.kayit_tarihi = "Kayıt tarihi zorunludur";
        newTouched.kayit_tarihi = true;
      }
      
      // Ücret kontrolü
      const ucretler = formValues.ucretler || [];
      if (ucretler.length > 0) {
        ucretler.forEach((ucret: any, index: number) => {
          if (ucret.aciklama && !ucret.miktar) {
            newErrors[`ucret_${index}`] = "Ücret açıklaması varsa miktar da girilmelidir";
            newTouched[`ucret_${index}`] = true;
          }
          if (ucret.miktar && !ucret.aciklama) {
            newErrors[`ucret_aciklama_${index}`] = "Ücret miktarı varsa açıklama da girilmelidir";
            newTouched[`ucret_aciklama_${index}`] = true;
          }
        });
      }
    }

    setFormErrors(newErrors);
    setTouched(prev => ({ ...prev, ...newTouched }));
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: any) => {
    // Alan dokunuldu olarak işaretle
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Hata mesajını temizle
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleFieldBlur = (field: string) => {
    // Alan dokunuldu olarak işaretle
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setFormErrors({});
    setTouched({});

    // Form validasyonu
    if (!validateForm()) {
      toast.error("Lütfen form hatalarını düzeltin");
      setIsSubmitting(false);
      return;
    }

    try {
      // Müşteri seçimi kontrolü
      const selectedCustomer = createRecordFormRef.current?.getSelectedCustomer();
      if (!selectedCustomer) {
        toast.error("Lütfen bir müşteri seçin");
        setIsSubmitting(false);
        return;
      }

      // Form değerlerini al
      const formValues = createRecordFormRef.current?.getFormValues();
      if (formValues) {
        // Form değerlerini FormData'ya ekle
        Object.entries(formValues).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (value instanceof Date) {
              formData.append(key, value.toISOString().split('T')[0]);
            } else {
              formData.append(key, String(value));
            }
          }
        });
      }

      // Müşteri ID'sini ekle
      formData.append('musteri_id', selectedCustomer._id || '');

      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          if (responseData.error.includes('onaylanmamış')) {
            toast.error('Hesabınız henüz onaylanmamış! Yöneticinizle iletişime geçin.');
          } else {
            toast.error(responseData.error);
          }
        } else if (response.status === 400) {
          toast.error('Lütfen tüm zorunlu alanları doldurun!');
        } else {
          toast.error('Fırsat oluşturulurken bir hata oluştu!');
        }
        setError(responseData.error || 'Bir hata oluştu');
        setIsSubmitting(false);
        return;
      }

      toast.success("İkamet izni fırsatı başarıyla oluşturuldu!");
      
      // Başarılı oluşturma sonrası dashboard'a yönlendir
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

      return responseData;
    } catch (error) {
      console.error("Fırsat oluşturma hatası:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 w-full">
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Geri Dön
          </Link>
          <div className="ml-4">
            <h1 className="text-xl font-semibold">
              İkamet İzni Fırsatı Oluştur
            </h1>
            <p className="text-sm text-muted-foreground">
              Müşteri seçerek ikamet izni fırsatı oluşturun
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 w-full">
        {/* Hata Mesajı */}
        {error && (
          <div className="mb-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-destructive">
                  {error}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form İçeriği */}
        <OpportunityFormWrapper
          title="İkamet İzni Fırsatı"
          description="Müşteri seçerek ikamet izni fırsatı oluşturun"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={formErrors}
          touched={touched}
        >
          <CreateRecordForm 
            ref={createRecordFormRef} 
            errors={formErrors}
            touched={touched}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
          />
        </OpportunityFormWrapper>
      </div>
    </div>
  )
} 