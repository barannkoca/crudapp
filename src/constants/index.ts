// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_PDF_TYPES: ['application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const;

// Validation rules
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 100
} as const;

// Cache keys
export const CACHE_KEYS = {
  CUSTOMERS: 'customers',
  OPPORTUNITIES: 'opportunities',
  // RECORDS kaldırıldı
  STATS: 'stats'
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAILY: 86400 // 24 hours
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'Yetkilendirme gerekli',
  INVALID_CREDENTIALS: 'Geçersiz kimlik bilgileri',
  TOKEN_EXPIRED: 'Token süresi dolmuş',
  INVALID_TOKEN: 'Geçersiz token',

  // Validation
  REQUIRED_FIELD: 'Bu alan zorunludur',
  INVALID_EMAIL: 'Geçerli bir email adresi girin',
  INVALID_PHONE: 'Geçerli bir telefon numarası girin',
  INVALID_ID: 'Geçersiz ID formatı',
  INVALID_DATE: 'Geçerli bir tarih girin',

  // Database
  NOT_FOUND: 'Kayıt bulunamadı',
  DUPLICATE_KEY: 'Bu kayıt zaten mevcut',
  DB_CONNECTION_ERROR: 'Veritabanı bağlantısı sağlanamadı',

  // File upload
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük',
  INVALID_FILE_TYPE: 'Geçersiz dosya türü',
  FILE_UPLOAD_ERROR: 'Dosya yüklenirken hata oluştu',

  // General
  INTERNAL_ERROR: 'Sunucu hatası',
  BAD_REQUEST: 'Geçersiz istek',
  FORBIDDEN: 'Bu işlem için yetkiniz yok'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Kayıt başarıyla oluşturuldu',
  UPDATED: 'Kayıt başarıyla güncellendi',
  DELETED: 'Kayıt başarıyla silindi',
  OPERATION_SUCCESSFUL: 'İşlem başarıyla tamamlandı'
} as const;

// Database collections
export const COLLECTIONS = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  OPPORTUNITIES: 'opportunities',
  // RECORDS kaldırıldı
} as const;

// İşlem türleri
export const ISLEM_TURLERI = {
  CALISMA_IZNI: 'calisma_izni',
  IKAMET_IZNI: 'ikamet_izni',
  DIGER: 'diger'
} as const;

// Durum seçenekleri
export const DURUMLAR = {
  BEKLEMEDE: 'beklemede',
  ISLEMDE: 'islemde',
  ONAYLANDI: 'onaylandi',
  REDDEDILDI: 'reddedildi',
  TAMAMLANDI: 'tamamlandi',
  IPTAL_EDILDI: 'iptal_edildi'
} as const;

// Para birimleri
export const PARA_BIRIMLERI = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP'
} as const;

// Cinsiyet seçenekleri
export const CINSIYETLER = {
  ERKEK: 'Erkek',
  KADIN: 'Kadın'
} as const;

// İkamet İzni - Yapılan İşlemler
export const ISLEMLER = [
  "İlk Başvuru",
  "Uzatma Başvurusu"
] as const;

// İkamet İzni - İkamet Türleri  
export const IKAMET_TURU = [
  "KISA DÖNEM",
  "UZUN DÖNEM", 
  "AİLE",
  "İNSANİ",
  "ÖĞRENCİ"
] as const;

// Çalışma İzni - Sözleşme Türleri
export const CALISMA_IZNI_SOZLESME_TURLERI = [
  'Belirsiz Süreli',
  'Belirli Süreli', 
  'Kısa Süreli',
  'Mevsimlik',
  'Yarı Zamanlı',
  'Tam Zamanlı'
] as const;