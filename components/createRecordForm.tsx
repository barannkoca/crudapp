"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { pdfToText } from 'pdf-ts';
import { useRouter } from "next/navigation";

import {
  userRecordSchema,
  UserRecordFormData,
  ILLER,
  ISLEMLER,
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
import { TextExtractionService } from "@/services/textExtractionService";
import { FormFillService } from "@/services/formFillService";

export function CreateRecordForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserRecordFormData>({
    resolver: zodResolver(userRecordSchema),
    defaultValues: {
      kayit_ili: "",
      yapilan_islem: "",
      kayit_tarihi: null,
      kayit_numarasi: "",
      adi: "",
      soyadi: "",
      baba_adi: "",
      anne_adi: "",
      yabanci_kimlik_no: "",
      uyrugu: "",
      cinsiyeti: "",
      medeni_hali: "",
      dogum_tarihi: null,
      belge_turu: "",
      belge_no: "",
      telefon_no: "",
      eposta: "",
      aciklama: "",
      photo: undefined,
      kayit_pdf: undefined
    },
  });

  const extractAndFillForm = (text: string) => {
    const extractionService = new TextExtractionService(text);
    const formFillService = new FormFillService(form);
    
    const extractedData = extractionService.extractData();
    formFillService.fillForm(extractedData);
  };

  async function onSubmit(values: UserRecordFormData) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Form verilerini FormData'ya ekle
      Object.entries(values).forEach(([key, value]) => {
        // Boş değerleri atla
        if (value === null || value === undefined || value === '') {
          return;
        }

        // Dosya alanlarını kontrol et
        if (key === 'photo' || key === 'kayit_pdf') {
          if (value instanceof File) {
            formData.append(key, value);
            console.log(`${key} dosyası eklendi:`, value.name);
          }
          return;
        }

        // Tarih alanlarını kontrol et
        if (key === 'kayit_tarihi' || key === 'dogum_tarihi') {
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
        throw new Error(responseData.error || "Kayıt oluşturulurken bir hata oluştu");
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
        {/* Dosya Yükleme Alanları */}
        <Card>
          <CardHeader>
            <CardTitle>Dosya Yükleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadField
                form={form}
                fieldName="photo"
                label="Fotoğraf"
                accept="image/*"
              />
              <FileUploadField
                form={form}
                fieldName="kayit_pdf"
                label="Kayıt PDF"
                accept="application/pdf"
                onFileSelect={async (file) => {
                  const arrayBuffer = await file.arrayBuffer();
                  const uint8Array = new Uint8Array(arrayBuffer);
                  const text = await pdfToText(uint8Array);
                  extractAndFillForm(text);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
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
            </div>
          </CardContent>
        </Card>

        {/* Kişisel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="adi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soyadi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyadı</FormLabel>
                    <FormControl>
                      <Input placeholder="Soyadı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baba_adi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baba Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Baba adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anne_adi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anne Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Anne adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yabanci_kimlik_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yabancı Kimlik No (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Yabancı kimlik numarası" 
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

              <FormField
                control={form.control}
                name="uyrugu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uyruğu</FormLabel>
                    <FormControl>
                      <Input placeholder="Uyruk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cinsiyeti"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cinsiyet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Erkek">Erkek</SelectItem>
                        <SelectItem value="Kadın">Kadın</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medeni_hali"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medeni Hali</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn. Bekar, Evli" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dogum_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doğum Tarihi</FormLabel>
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

        {/* İletişim Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="belge_turu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Belge Türü</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn. Pasaport, Kimlik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="belge_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Belge No</FormLabel>
                    <FormControl>
                      <Input placeholder="Belge numarası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefon_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon No</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefon numarası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eposta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input placeholder="E-posta adresi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Diğer Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Diğer Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="aciklama"
                render={({ field }) => (
                  <FormItem className="col-span-full">
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
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
