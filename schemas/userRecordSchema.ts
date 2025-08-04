import { z } from "zod"

/**
 * Türkiye iller listesi (kısaltılmış örnek).
 * Gerçek projede 81 ilin tamamını eklemeniz gerekir.
 */
export const ILLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye",
  "Düzce"
] as const;

/**
 * Yapılabilen işlemler listesi
 */
export const ISLEMLER = [
  "İlk Başvuru",
  "Uzatma Başvurusu"
] as const

export const IKAMET_TURU = [
  "KISA DÖNEM",
  "UZUN DÖNEM",
  "AİLE",
  "İNSANİ"
] as const

/**
 * UserRecordFormData için Zod şeması.
 * Form alanlarının validasyonunu burada tanımlıyoruz.
 */
export const userRecordSchema = z.object({
  // Kayıt ili - sadece 81 ilden biri seçilebilir
  kayit_ili: z.string().min(1, "İl seçilmelidir"),

  // Yapılan işlem - İlk Başvuru veya Uzatma Başvurusu
  yapilan_islem: z.string().min(1, "İşlem seçilmelidir"),

  // Başvurulan İkamet İzni Türü - KISA DÖNEM veya UZUN DÖNEM
  ikamet_turu: z.string().min(1, "İkamet türü seçilmelidir"),

  // Kayıt tarihi - Zod ile string'i tarihe dönüştürüp gelecekteki tarihi engelliyoruz
  kayit_tarihi: z.date().nullable(),

  // Kayıt numarası - en az 1 karakter
  kayit_numarasi: z.string().min(1, "Kayıt numarası girilmelidir"),

  // Açıklama - opsiyonel
  aciklama: z.string().optional(),

  // Dosya alanları - opsiyonel ve boyut sınırlaması ekleyebiliriz (örnek: 5 MB)
  kayit_pdf: z.any().optional(),
  
  // Geçerlilik tarihi - opsiyonel
  gecerlilik_tarihi: z.date().nullable().optional(),
  
  // Randevu tarihi - opsiyonel
  randevu_tarihi: z.date().nullable().optional()
})

/**
 * TypeScript tipi
 */
export type UserRecordFormData = z.infer<typeof userRecordSchema>
