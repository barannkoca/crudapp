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
  "Kısa Dönem İlk Başvuru",
  "Kısa Dönem İlk Aile Başvurusu",
  "Kısa Dönem Uzatma Başvurusu",
  "Kısa Dönem Aile Uzatma Başvurusu",
  "Çalışma İzni Başvurusu"
] as const

/**
 * UserRecordFormData için Zod şeması.
 * Form alanlarının validasyonunu burada tanımlıyoruz.
 */
export const userRecordSchema = z.object({
  // Kayıt ili - sadece 81 ilden biri seçilebilir
  kayit_ili: z.string().min(1, "İl seçilmelidir"),

  // Yapılan işlem - belirli 5 seçenekten biri olmalı
  yapilan_islem: z.string().min(1, "İşlem seçilmelidir"),

  // Kayıt tarihi - Zod ile string'i tarihe dönüştürüp gelecekteki tarihi engelliyoruz
  kayit_tarihi: z.date().nullable(),

  // Kayıt numarası - en az 1 karakter
  kayit_numarasi: z.string().min(1, "Kayıt numarası girilmelidir"),

  // İsim - en az 2 karakter
  adi: z.string().min(2, "Ad en az 2 karakter olmalıdır"),

  // Soyad - en az 2 karakter
  soyadi: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),

  // Baba Adı - en az 2 karakter
  baba_adi: z.string().min(2, "Baba adı en az 2 karakter olmalıdır"),

  // Anne Adı - en az 2 karakter
  anne_adi: z.string().min(2, "Anne adı en az 2 karakter olmalıdır"),

  // Yabancı kimlik no - en az 10 karakter
  yabanci_kimlik_no: z.string().optional().nullable(),

  // Uyruk - en az 2 karakter
  uyrugu: z.string().min(1, "Uyruk bilgisi girilmelidir"),

  // Cinsiyet - sadece 'Erkek' veya 'Kadın' seçilebilir
  cinsiyeti: z.string().min(1, "Cinsiyet seçilmelidir"),

  // Medeni hali - en az 1 karakter (isterseniz enum da yapabilirsiniz)
  medeni_hali: z.string().min(1, "Medeni hal bilgisi girilmelidir"),

  // Doğum tarihi - tarih olarak parse ediyoruz, gelecekteki tarih girilemez
  dogum_tarihi: z.date().nullable(),

  // Belge türü - en az 2 karakter (Pasaport, Kimlik vb. isterseniz z.enum yapabilirsiniz)
  belge_turu: z.string().min(1, "Belge türü girilmelidir"),

  // Belge no - en az 1 karakter
  belge_no: z.string().min(1, "Belge numarası girilmelidir"),

  // Telefon no - regex ile yalnızca rakam ve en az 10 karakter
  telefon_no: z.string().min(10, "Telefon numarası en az 10 haneli olmalıdır"),

  // E-posta - geçerli format
  eposta: z.string().email("Geçerli bir e-posta adresi giriniz"),

  // Açıklama - opsiyonel
  aciklama: z.string().optional(),

  // Dosya alanları - opsiyonel ve boyut sınırlaması ekleyebiliriz (örnek: 5 MB)
  photo: z.any().optional(),

  kayit_pdf: z.any().optional()
})

/**
 * TypeScript tipi
 */
export type UserRecordFormData = z.infer<typeof userRecordSchema>
