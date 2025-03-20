import { z } from "zod"

/**
 * Türkiye iller listesi (kısaltılmış örnek).
 * Gerçek projede 81 ilin tamamını eklemeniz gerekir.
 */
export const TURKISH_PROVINCES = [
    "Adana",
    "Adıyaman",
    "Afyonkarahisar",
    "Ağrı",
    "Aksaray",
    "Amasya",
    "Ankara",
    "Antalya",
    "Ardahan",
    "Artvin",
    "Aydın",
    "Balıkesir",
    "Bartın",
    "Batman",
    "Bayburt",
    "Bilecik",
    "Bingöl",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Çanakkale",
    "Çankırı",
    "Çorum",
    "Denizli",
    "Diyarbakır",
    "Düzce",
    "Edirne",
    "Elazığ",
    "Erzincan",
    "Erzurum",
    "Eskişehir",
    "Gaziantep",
    "Giresun",
    "Gümüşhane",
    "Hakkari",
    "Hatay",
    "Iğdır",
    "Isparta",
    "İstanbul",
    "İzmir",
    "Kahramanmaraş",
    "Karabük",
    "Karaman",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kırıkkale",
    "Kırklareli",
    "Kırşehir",
    "Kilis",
    "Kocaeli",
    "Konya",
    "Kütahya",
    "Malatya",
    "Manisa",
    "Mardin",
    "Mersin",
    "Muğla",
    "Muş",
    "Nevşehir",
    "Niğde",
    "Ordu",
    "Osmaniye",
    "Rize",
    "Sakarya",
    "Samsun",
    "Siirt",
    "Sinop",
    "Sivas",
    "Şanlıurfa",
    "Şırnak",
    "Tekirdağ",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Uşak",
    "Van",
    "Yalova",
    "Yozgat",
    "Zonguldak",
  ] as const;  

/**
 * Yapılabilen işlemler listesi
 */
export const ISLEMLER = [
  "Kısa Dönem İlk Başvuru",
  "Kısa Dönem İlk Aile Başvurusu",
  "Kısa Dönem Uzatma Başvurusu",
  "Kısa Dönem Aile Uzatma Başvurusu",
  "Çalışma İzni Başvurusu",
] as const

/**
 * UserRecordFormData için Zod şeması.
 * Form alanlarının validasyonunu burada tanımlıyoruz.
 */
export const userRecordSchema = z.object({
  // Kayıt ili - sadece 81 ilden biri seçilebilir
  kayit_ili: z.enum(TURKISH_PROVINCES, {
    errorMap: () => ({ message: "Lütfen geçerli bir il seçin." }),
  }),

  // Yapılan işlem - belirli 5 seçenekten biri olmalı
  yapilan_islem: z.enum(ISLEMLER, {
    errorMap: () => ({ message: "Geçerli bir işlem seçin." }),
  }),

  // Kayıt tarihi - Zod ile string'i tarihe dönüştürüp gelecekteki tarihi engelliyoruz
  kayit_tarihi: z.coerce.date()
    .refine(
      (val) => val <= new Date(),
      { message: "Kayıt tarihi bugünden ileride olamaz." }
    ),

  // Kayıt numarası - en az 1 karakter
  kayit_numarasi: z.string().min(1, { message: "Kayıt numarası zorunludur." }),

  // İsim - en az 2 karakter
  adi: z.string().min(2, { message: "Adınız en az 2 karakter olmalıdır." }),

  // Soyad - en az 2 karakter
  soyadi: z.string().min(2, { message: "Soyadınız en az 2 karakter olmalıdır." }),

  // Baba Adı - en az 2 karakter
  baba_adi: z.string().min(2, { message: "Baba adı en az 2 karakter olmalıdır." }),

  // Anne Adı - en az 2 karakter
  anne_adi: z.string().min(2, { message: "Anne adı en az 2 karakter olmalıdır." }),

  // Yabancı kimlik no - en az 10 karakter
  yabanci_kimlik_no: z
    .string()
    .min(10, { message: "Yabancı kimlik numarası en az 10 karakter olmalıdır." })
    // Örnek olarak sadece rakamlardan oluşsun derseniz:
    .regex(/^\d+$/, { message: "Yabancı kimlik numarası yalnızca rakamlardan oluşmalıdır." }),

  // Uyruk - en az 2 karakter
  uyrugu: z.string().min(2, { message: "Uyruk bilgisi en az 2 karakter olmalıdır." }),

  // Cinsiyet - sadece 'Erkek' veya 'Kadın' seçilebilir
  cinsiyeti: z.enum(["Erkek", "Kadın"], {
    errorMap: () => ({
      message: "Lütfen cinsiyet olarak 'Erkek' veya 'Kadın' seçiniz.",
    }),
  }),

  // Medeni hali - en az 1 karakter (isterseniz enum da yapabilirsiniz)
  medeni_hali: z.string().min(1, { message: "Medeni hal zorunludur." }),

  // Doğum tarihi - tarih olarak parse ediyoruz, gelecekteki tarih girilemez
  dogum_tarihi: z.coerce.date()
    .refine(
      (val) => val <= new Date(),
      { message: "Doğum tarihi bugünden ileride olamaz." }
    ),

  // Belge türü - en az 2 karakter (Pasaport, Kimlik vb. isterseniz z.enum yapabilirsiniz)
  belge_turu: z.string().min(2, { message: "Belge türü en az 2 karakter olmalıdır." }),

  // Belge no - en az 1 karakter
  belge_no: z.string().min(1, { message: "Belge numarası zorunludur." }),

  // Telefon no - regex ile yalnızca rakam ve en az 10 karakter
  telefon_no: z
    .string()
    .regex(/^\d{10,}$/, { message: "Telefon numarası en az 10 haneli olmalı ve rakamlardan oluşmalıdır." }),

  // E-posta - geçerli format
  eposta: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),

  // Açıklama - opsiyonel
  aciklama: z.string().optional(),

  // Dosya alanları - opsiyonel ve boyut sınırlaması ekleyebiliriz (örnek: 5 MB)
  photo: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5_000_000,
    { message: "Fotoğraf dosya boyutu 5 MB'ı geçemez." }
  ),

  kayit_pdf: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5_000_000,
    { message: "Kayıt PDF dosya boyutu 5 MB'ı geçemez." }
  ),

  saglik_sigortasi_pdf: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5_000_000,
    { message: "Sağlık Sigortası PDF dosya boyutu 5 MB'ı geçemez." }
  ),
})

/**
 * TypeScript tipi
 */
export type UserRecordFormData = z.infer<typeof userRecordSchema>
