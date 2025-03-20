"use client"

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  kayit_ili: z.string().min(4, { message: "Year must be at least 4 digits." }),
  yapilan_islem: z.string().min(2, { message: "Operation must be specified." }),
  kayit_tarihi: z.string().min(1, { message: "Registration date is required." }),
  kayit_numarasi: z.string().min(1, { message: "Registration number is required." }),
  adi: z.string().min(2, { message: "First name is required." }),
  soyadi: z.string().min(2, { message: "Last name is required." }),
  baba_adi: z.string().min(2, { message: "Father's name is required." }),
  anne_adi: z.string().min(2, { message: "Mother's name is required." }),
  yabanci_kimlik_no: z.string().min(10, { message: "Foreign ID number must be at least 10 digits." }),
  uyrugu: z.string().min(2, { message: "Nationality is required." }),
  cinsiyeti: z.string().min(1, { message: "Gender is required." }),
  medeni_hali: z.string().min(1, { message: "Marital status is required." }),
  dogum_tarihi: z.string().min(1, { message: "Birthdate is required." }),
  belge_turu: z.string().min(2, { message: "Document type is required." }),
  belge_no: z.string().min(1, { message: "Document number is required." }),
  telefon_no: z.string().min(10, { message: "Phone number is required." }),
  eposta: z.string().email({ message: "Invalid email address." }),
  aciklama: z.string().optional(),
  photo: z.instanceof(File).optional(),
  kayit_pdf: z.instanceof(File).optional(),
  saglik_sigortasi_pdf: z.instanceof(File).optional(),
})

export default function CreateForm() {
  const [preview, setPreview] = useState<string | null>(null); // Fotoğraf önizlemesi için durum
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

      // Form bileşeninizde
const fileInputRef = useRef<HTMLInputElement | null>(null);
const photoInputRef = useRef<HTMLInputElement | null>(null);
const kayitPdfInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Fotoğraf yüklendiğinde önizleme oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Fotoğrafı Kaldır
  const removePhoto = () => {
    // form’daki "photo" alanını sıfırlıyoruz
    form.setValue("photo", undefined);
    // input’u sıfırlıyoruz
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    // önizlemeyi de sıfırlıyoruz
    setPreview(null);
  };

  // Kayıt PDF'yi silme
  const removeKayitPdf = () => {
    // form’daki "kayit_pdf" alanını sıfırlıyoruz
    form.setValue("kayit_pdf", undefined);
    // input’u sıfırlıyoruz
    if (kayitPdfInputRef.current) {
      kayitPdfInputRef.current.value = "";
    }
  };
  
    // Kaldır butonunun handler’ı
    const removeSaglikPdf = () => {
      // Form alanını sıfırla
      form.setValue("saglik_sigortasi_pdf", undefined);

      // Asıl input değerini de temizlemek için ref kullanalım
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    console.log(values)
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 py-8 bg-white rounded-lg shadow-md">
    <h1 className="text-2xl font-bold mb-6 text-center">
      Kayıt Oluştur
    </h1>
    <p className="text-gray-500 mb-8 text-center">
      Lütfen tüm bilgileri eksiksiz doldurun.
    </p>
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Fotoğraf Yükleme */}
          <FormItem className="flex flex-col gap-2 w-full md:w-1/3">
          <FormLabel className="font-semibold text-gray-700">Fotoğraf</FormLabel>
          <FormControl>
            <Input
              ref={photoInputRef} // File input ref
              type="file"
              accept="image/*"
              onChange={(event) => {
                form.setValue("photo", event.target.files && event.target.files[0]);
                handlePhotoChange(event);
              }}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
            />
          </FormControl>
          <FormMessage className="text-red-600 text-sm" />

          {/* Seçili Fotoğrafı Önizleme + Kaldır Butonu */}
          {preview && (
            <div className="mt-4 flex flex-col sm:items-center gap-2">
              <img
                src={preview}
                alt="Önizleme"
                className="max-w-full h-auto rounded-md border border-gray-300"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="text-red-500 text-sm underline hover:text-red-600 self-start sm:self-center"
              >
                Kaldır
              </button>
            </div>
          )}
        </FormItem>

          <div className="flex flex-col gap-6 w-full md:w-2/3">
            {/* Kayıt PDF Yükleme */}
            <FormField
            control={form.control}
            name="kayit_pdf"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="font-semibold text-gray-700">Kayıt PDF</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    ref={kayitPdfInputRef} // File input ref
                    type="file"
                    accept="image/*, application/pdf"
                    onChange={(event) => {
                      onChange(event.target.files && event.target.files[0]);
                    }}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-sm" />

                {/* Dosya seçiliyse adını göster + Kaldır */}
                {value && (
                  <div className="flex flex-col sm:items-start gap-1">
                    <p className="text-xs text-gray-600">Seçilen dosya: {value.name}</p>
                    <button
                      type="button"
                      onClick={removeKayitPdf}
                      className="text-red-500 text-sm underline hover:text-red-600"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </FormItem>
            )}
          />

            {/* Sağlık Sigortası PDF Yükleme */}
            <FormField
              control={form.control}
              name="saglik_sigortasi_pdf"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-semibold text-gray-700">
                    Sağlık Sigortası PDF
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      ref={fileInputRef}
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(event) => {
                        onChange(event.target.files && event.target.files[0]);
                      }}
                      className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm" />

                  {value && (
                    <div className="flex flex-col sm:items-start gap-1">
                      <p className="text-xs text-gray-600">
                        Seçilen dosya: {value.name}
                      </p>
                      <button
                        type="button"
                        onClick={removeSaglikPdf}
                        className="text-red-500 text-sm underline hover:text-red-600"
                      >
                        Kaldır
                      </button>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>
        </div>

          {/* Kayıt Yılı */}
          <FormField
            control={form.control}
            name="kayit_ili"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Kayıt Yılı
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Örn: 2023"
                    {...field}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
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
                <FormLabel className="font-semibold text-gray-700">
                  Yapılan İşlem
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Yapılan işlemi giriniz"
                    {...field}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
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
                <FormLabel className="font-semibold text-gray-700">
                  Kayıt Tarihi
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="Kayıt Tarihini Seçin"
                    {...field}
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
                <FormLabel className="font-semibold text-gray-700">
                  Kayıt Numarası
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Kayıt Numarası"
                    {...field}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />

          {/* Ad */}
          <FormField
            control={form.control}
            name="adi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Ad
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Adınızı girin"
                    {...field}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />

          {/* Soyad */}
          <FormField
            control={form.control}
            name="soyadi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Soyad
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Soyadınızı girin"
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
                <FormLabel className="font-semibold text-gray-700">
                  Baba Adı
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Baba adını girin"
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
                <FormLabel className="font-semibold text-gray-700">
                  Anne Adı
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Anne adını girin"
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
                <FormLabel className="font-semibold text-gray-700">
                  Yabancı Kimlik No
                </FormLabel>
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
                <FormLabel className="font-semibold text-gray-700">
                  Uyruk
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Uyruk bilgisini girin"
                    {...field}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />

          {/* Cinsiyet */}
          <FormField
            control={form.control}
            name="cinsiyeti"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Cinsiyet
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Cinsiyetinizi girin"
                    {...field}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
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
                <FormLabel className="font-semibold text-gray-700">
                  Medeni Hal
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Evli, Bekâr vb."
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
                <FormLabel className="font-semibold text-gray-700">
                  Doğum Tarihi
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="Doğum Tarihini Seçin"
                    {...field}
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
                <FormLabel className="font-semibold text-gray-700">
                  Belge Türü
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Örn: Pasaport, Kimlik"
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
                <FormLabel className="font-semibold text-gray-700">
                  Belge Numarası
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Belge Numarası"
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
                <FormLabel className="font-semibold text-gray-700">
                  Telefon Numarası
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Telefon Numaranızı girin"
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
                <FormLabel className="font-semibold text-gray-700">
                  E-posta
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E-posta Adresiniz"
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
                <FormLabel className="font-semibold text-gray-700">
                  Açıklama
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Eklemek istediğiniz bilgileri girin"
                    {...field}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />

          {/* Gönder Butonu */}
          <div className="pt-4">
            <Button type="submit" className="w-full md:w-auto">
              Gönder
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
