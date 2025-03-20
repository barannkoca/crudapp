"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  userRecordSchema,
  UserRecordFormData,
  TURKISH_PROVINCES,
  ISLEMLER,
} from "@/schemas/userRecordSchema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Dosya yükleme alanı için oluşturduğumuz bileşen
import { FileUploadField } from "@/components/fields/FileUploadField";

export function CreateRecordForm() {
  // react-hook-form kurulum
  const form = useForm<UserRecordFormData>({
    resolver: zodResolver(userRecordSchema),
  });

  // Form submit olayı
  function onSubmit(values: UserRecordFormData) {
    console.log("Form Values:", values);
    // Burada API'ye gönderme vb. işlemleri yapabilirsiniz
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex gap-4">
        {/* Fotoğraf Dosyası */}
        <FileUploadField
          form={form}
          fieldName="photo"
          label="Fotoğraf"
          accept="image/*"
        />

        {/* Kayıt PDF */}
        <FileUploadField
          form={form}
          fieldName="kayit_pdf"
          label="Kayıt PDF"
          accept="application/pdf,image/*"
        />

        {/* Sağlık Sigortası PDF */}
        <FileUploadField
          form={form}
          fieldName="saglik_sigortasi_pdf"
          label="Sağlık Sigortası PDF"
          accept="application/pdf,image/*"
        />
        </div>

        {/* Kayıt İli */}
        <FormField
          control={form.control}
          name="kayit_ili"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kayıt İli</FormLabel>
              <FormControl>
                <select
                  {...field}
                  // Tailwind stilleri
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="">İl Seçiniz</option>
                  {TURKISH_PROVINCES.map((il) => (
                    <option key={il} value={il}>
                      {il}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Yapılan İşlem */}
        <FormField
          control={form.control}
          name="yapilan_islem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yapılan İşlem</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="">İşlem Seçiniz</option>
                  {ISLEMLER.map((islem) => (
                    <option key={islem} value={islem}>
                      {islem}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Kayıt Tarihi */}
        <FormField
          control={form.control}
          name="kayit_tarihi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kayıt Tarihi</FormLabel>
              <FormControl>
              <Input
                type="date"
                value={
                    field.value instanceof Date
                    ? field.value.toISOString().slice(0, 10)  // "YYYY-MM-DD"
                    : ""
                }
                onChange={(e) => {
                    // Kullanıcı yeni tarih seçtiğinde, string'i tekrar Date nesnesine çeviriyoruz
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Kayıt Numarası */}
        <FormField
          control={form.control}
          name="kayit_numarasi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kayıt Numarası</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kayıt numarası girin"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Adı */}
        <FormField
          control={form.control}
          name="adi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adı</FormLabel>
              <FormControl>
                <Input
                  placeholder="Adı"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Soyadı */}
        <FormField
          control={form.control}
          name="soyadi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Soyadı</FormLabel>
              <FormControl>
                <Input
                  placeholder="Soyadı"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Baba Adı */}
        <FormField
          control={form.control}
          name="baba_adi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Baba Adı</FormLabel>
              <FormControl>
                <Input
                  placeholder="Baba adı"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Anne Adı */}
        <FormField
          control={form.control}
          name="anne_adi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anne Adı</FormLabel>
              <FormControl>
                <Input
                  placeholder="Anne adı"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Yabancı Kimlik No */}
        <FormField
          control={form.control}
          name="yabanci_kimlik_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yabancı Kimlik No</FormLabel>
              <FormControl>
                <Input
                  placeholder="Yabancı kimlik numarası"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Uyruk */}
        <FormField
          control={form.control}
          name="uyrugu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uyruk</FormLabel>
              <FormControl>
                <Input
                  placeholder="Uyruk"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Cinsiyeti (Select olarak ya da RadioGroup ile) */}
        <FormField
          control={form.control}
          name="cinsiyeti"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cinsiyet</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Medeni Hali */}
        <FormField
          control={form.control}
          name="medeni_hali"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medeni Hali</FormLabel>
              <FormControl>
                <Input
                  placeholder="Örn. Bekar, Evli"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Doğum Tarihi */}
        <FormField
          control={form.control}
          name="dogum_tarihi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doğum Tarihi</FormLabel>
              <FormControl>
              <Input
                type="date"
                value={
                    field.value instanceof Date
                    ? field.value.toISOString().slice(0, 10)  // "YYYY-MM-DD"
                    : ""
                }
                onChange={(e) => {
                    // Kullanıcı yeni tarih seçtiğinde, string'i tekrar Date nesnesine çeviriyoruz
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Belge Türü */}
        <FormField
          control={form.control}
          name="belge_turu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belge Türü</FormLabel>
              <FormControl>
                <Input
                  placeholder="Örn. Pasaport, Kimlik"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Belge No */}
        <FormField
          control={form.control}
          name="belge_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belge Numarası</FormLabel>
              <FormControl>
                <Input
                  placeholder="Belge numarası"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Telefon Numarası */}
        <FormField
          control={form.control}
          name="telefon_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon Numarası</FormLabel>
              <FormControl>
                <Input
                  placeholder="Telefon numarası"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* E-posta */}
        <FormField
          control={form.control}
          name="eposta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input
                  placeholder="E-posta adresi"
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Açıklama */}
        <FormField
          control={form.control}
          name="aciklama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Eklemek istediğiniz notlar..."
                  {...field}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        {/* Gönder Butonu */}
        <Button type="submit" className="w-full md:w-auto">
          Gönder
        </Button>
      </form>
    </Form>
  );
}
