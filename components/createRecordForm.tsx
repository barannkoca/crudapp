"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { pdfToText } from 'pdf-ts';
import { useRouter } from "next/navigation";
import { ICustomer } from "@/types/Customer";

import {
  userRecordSchema,
  UserRecordFormData,
  ILLER,
  ISLEMLER,
  IKAMET_TURU,
} from "@/schemas/userRecordSchema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/components/fields/FileUploadField";
import { CustomerSelect } from "@/components/CustomerSelect";
import { TextExtractionService } from "@/services/textExtractionService";
import { FormFillService } from "@/services/formFillService";

export function CreateRecordForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | undefined>();

  const form = useForm<UserRecordFormData>({
    resolver: zodResolver(userRecordSchema),
    defaultValues: {
      kayit_ili: "",
      yapilan_islem: "",
      ikamet_turu: "",
      kayit_tarihi: null,
      kayit_numarasi: "",
      aciklama: "",
      kayit_pdf: undefined,
      gecerlilik_tarihi: null,
      randevu_tarihi: null
    },
  });

  const extractAndFillForm = (text: string) => {
    const extractionService = new TextExtractionService(text);
    const formFillService = new FormFillService(form);
    
    const extractedData = extractionService.extractData();
    formFillService.fillForm(extractedData);
  };

  async function onSubmit(values: UserRecordFormData) {
    if (!selectedCustomer) {
      toast.error("Lütfen bir müşteri seçin");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Müşteri ID'sini ekle
      formData.append('musteri_id', selectedCustomer._id || '');
      
      // Form verilerini FormData'ya ekle
      Object.entries(values).forEach(([key, value]) => {
        // Boş değerleri atla
        if (value === null || value === undefined || value === '') {
          return;
        }

        // Dosya alanlarını kontrol et
        if (key === 'kayit_pdf') {
          if (value instanceof File) {
            formData.append(key, value);
            console.log(`${key} dosyası eklendi:`, value.name);
          }
          return;
        }

        // Tarih alanlarını kontrol et
        if (key === 'kayit_tarihi' || key === 'gecerlilik_tarihi' || key === 'randevu_tarihi') {
          if (value instanceof Date) {
            const dateStr = value.toISOString().split('T')[0];
            formData.append(key, dateStr);
            console.log(`${key} tarihi eklendi:`, dateStr);
          }
          return;
        }

        // Diğer alanları ekle
        formData.append(key, value.toString());
        console.log(`${key} alanı eklendi:`, value);
      });

      console.log('Form verileri hazırlandı, gönderiliyor...');

      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      // Önce response type'ı kontrol et
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('Geçersiz yanıt tipi:', contentType);
        throw new Error('Sunucudan geçersiz yanıt tipi alındı');
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        console.error('JSON parse hatası:', error);
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }

      console.log('Sunucu yanıtı:', responseData);

      if (!response.ok) {
        console.error('Kayıt oluşturma hatası:', responseData.error);
        
        // HTTP durum koduna göre farklı mesajlar göster
        if (response.status === 403) {
          if (responseData.error.includes('onaylanmamış')) {
            toast.error('Hesabınız henüz onaylanmamış! Yöneticinizle iletişime geçin.');
          } else if (responseData.error.includes('şirkete üye')) {
            toast.error('Lütfen önce bir şirket oluşturun veya mevcut bir şirkete katılın!');
          } else {
            toast.error(responseData.error);
          }
        } else if (response.status === 400) {
          toast.error('Lütfen tüm zorunlu alanları doldurun!');
        } else {
          toast.error('Kayıt oluşturulurken bir hata oluştu!');
        }
        return;
      }

      toast.success("Kayıt başarıyla oluşturuldu");
      router.push("/dashboard");
    } catch (error) {
      console.error("Kayıt oluşturma hatası:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Kayıt oluşturulurken bir hata oluştu");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Müşteri Seçimi */}
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Seçimi</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSelect
              onCustomerSelect={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
              label="İkamet İzni Başvurusu Yapılacak Müşteri"
            />
          </CardContent>
        </Card>

        {/* Dosya Yükleme Alanları */}
        <Card>
          <CardHeader>
            <CardTitle>Dosya Yükleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <FileUploadField
                form={form}
                fieldName="kayit_pdf"
                label="Kayıt PDF"
                accept="application/pdf"
                onFileSelect={async (file) => {
                  try {
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const text = await pdfToText(uint8Array);
                    extractAndFillForm(text);
                  } catch (error) {
                    console.error('PDF işleme hatası:', error);
                    toast.error('PDF dosyası işlenirken bir hata oluştu');
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>İkamet İzni Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="kayit_ili"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kayıt İli</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="İl Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ILLER.map((il: string) => (
                          <SelectItem key={il} value={il}>{il}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yapilan_islem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yapılan İşlem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="İşlem Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ISLEMLER.map((islem) => (
                          <SelectItem key={islem} value={islem}>{islem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ikamet_turu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İkamet Türü</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="İkamet Türü Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IKAMET_TURU.map((tur: string) => (
                          <SelectItem key={tur} value={tur}>{tur}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kayit_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kayıt Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.toISOString().slice(0, 10) : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          field.onChange(date);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kayit_numarasi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kayıt Numarası</FormLabel>
                    <FormControl>
                      <Input placeholder="Kayıt numarası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gecerlilik_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geçerlilik Tarihi (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.toISOString().slice(0, 10) : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          field.onChange(date);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="randevu_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Randevu Tarihi (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.toISOString().slice(0, 10) : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          field.onChange(date);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>



        {/* Açıklama */}
        <Card>
          <CardHeader>
            <CardTitle>Ek Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="aciklama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Eklemek istediğiniz notlar..." 
                        className="min-h-[100px]"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gönder Butonu */}
        <div className="flex gap-3 pt-3">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
          >
            {isSubmitting ? "Kaydediliyor..." : "İkamet İzni Kaydı Oluştur"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="flex-1"
          >
            İptal
          </Button>
        </div>
      </form>
    </Form>
  );
}
