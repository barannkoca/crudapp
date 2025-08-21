import { Types } from 'mongoose';

/**
 * Veri Bütünlüğü Yardımcı Fonksiyonları
 */

// 1. Input Sanitization
export class DataSanitizer {
  
  // String temizleme
  static sanitizeString(input: string, maxLength: number = 255): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // XSS koruması
      .replace(/['"]/g, '') // SQL injection koruması
      .substring(0, maxLength);
  }

  // Numerik değer doğrulama
  static sanitizeNumber(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number | null {
    const num = Number(input);
    if (isNaN(num)) return null;
    if (num < min || num > max) return null;
    return num;
  }

  // Email format kontrolü
  static sanitizeEmail(email: string): string | null {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleaned = email.toLowerCase().trim();
    return emailRegex.test(cleaned) ? cleaned : null;
  }

  // Telefon numarası temizleme
  static sanitizePhone(phone: string): string | null {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, ''); // Sadece rakamlar
    return cleaned.length >= 10 ? cleaned : null;
  }

  // MongoDB ObjectId doğrulama
  static sanitizeObjectId(id: string): string | null {
    if (!id || !Types.ObjectId.isValid(id)) return null;
    return id;
  }

  // Tarih doğrulama
  static sanitizeDate(date: string | Date): Date | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return null;
    
    // Makul tarih aralığı kontrolü (1900-2100)
    const year = parsedDate.getFullYear();
    if (year < 1900 || year > 2100) return null;
    
    return parsedDate;
  }
}

// 2. Schema Validation
export class SchemaValidator {
  
  // Diğer işlemler detaylarını validate et
  static validateDigerDetaylar(detaylar: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allowedFields = ['islem_adi', 'baslama_tarihi', 'bitis_tarihi'];
    
    if (!detaylar || typeof detaylar !== 'object') {
      errors.push('Detaylar alanı gerekli');
      return { isValid: false, errors };
    }

    // İşlem adı zorunlu
    if (!detaylar.islem_adi || typeof detaylar.islem_adi !== 'string') {
      errors.push('İşlem adı zorunludur');
    } else if (detaylar.islem_adi.length < 2 || detaylar.islem_adi.length > 100) {
      errors.push('İşlem adı 2-100 karakter arası olmalıdır');
    }

    // Tarih validasyonu
    if (detaylar.baslama_tarihi) {
      const startDate = DataSanitizer.sanitizeDate(detaylar.baslama_tarihi);
      if (!startDate) {
        errors.push('Geçersiz başlama tarihi');
      }
    }

    if (detaylar.bitis_tarihi) {
      const endDate = DataSanitizer.sanitizeDate(detaylar.bitis_tarihi);
      if (!endDate) {
        errors.push('Geçersiz bitiş tarihi');
      }
    }

    // Başlama-bitiş tarihi mantık kontrolü
    if (detaylar.baslama_tarihi && detaylar.bitis_tarihi) {
      const start = new Date(detaylar.baslama_tarihi);
      const end = new Date(detaylar.bitis_tarihi);
      if (start > end) {
        errors.push('Bitiş tarihi başlama tarihinden sonra olmalıdır');
      }
    }

    // İzin verilmeyen alanları kontrol et
    const providedFields = Object.keys(detaylar);
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      errors.push(`İzin verilmeyen alanlar: ${invalidFields.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Çalışma izni detaylarını validate et
  static validateCalismaIzniDetaylar(detaylar: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allowedFields = ['isveren', 'pozisyon', 'sozlesme_turu', 'maas', 'calisma_saati'];

    if (!detaylar || typeof detaylar !== 'object') {
      errors.push('Çalışma izni detayları gerekli');
      return { isValid: false, errors };
    }

    // Zorunlu string alanları
    const requiredStringFields = ['isveren', 'pozisyon', 'sozlesme_turu'];
    requiredStringFields.forEach(field => {
      if (!detaylar[field] || typeof detaylar[field] !== 'string' || detaylar[field].trim().length < 2) {
        errors.push(`${field} alanı en az 2 karakter olmalıdır`);
      }
    });

    // Maaş kontrolü
    const maas = DataSanitizer.sanitizeNumber(detaylar.maas, 1, 1000000);
    if (maas === null) {
      errors.push('Geçerli bir maaş bilgisi girin (1-1.000.000 TL)');
    }

    // Çalışma saati kontrolü
    const calisma_saati = DataSanitizer.sanitizeNumber(detaylar.calisma_saati, 1, 168);
    if (calisma_saati === null) {
      errors.push('Geçerli bir çalışma saati girin (1-168 saat)');
    }

    // İzin verilmeyen alanları kontrol et
    const providedFields = Object.keys(detaylar);
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      errors.push(`İzin verilmeyen alanlar: ${invalidFields.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // İkamet izni detaylarını validate et
  static validateIkametIzniDetaylar(detaylar: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allowedFields = ['yapilan_islem', 'ikamet_turu', 'kayit_tarihi', 'kayit_numarasi', 'gecerlilik_tarihi', 'randevu_tarihi'];

    if (!detaylar || typeof detaylar !== 'object') {
      errors.push('İkamet izni detayları gerekli');
      return { isValid: false, errors };
    }

    // Zorunlu alanlar
    if (!detaylar.yapilan_islem || detaylar.yapilan_islem.trim().length < 2) {
      errors.push('Yapılan işlem bilgisi gerekli');
    }

    if (!detaylar.ikamet_turu || detaylar.ikamet_turu.trim().length < 2) {
      errors.push('İkamet türü bilgisi gerekli');
    }

    if (!detaylar.kayit_numarasi || detaylar.kayit_numarasi.trim().length < 3) {
      errors.push('Kayıt numarası en az 3 karakter olmalıdır');
    }

    // Tarih validasyonları
    if (detaylar.kayit_tarihi && !DataSanitizer.sanitizeDate(detaylar.kayit_tarihi)) {
      errors.push('Geçersiz kayıt tarihi');
    }

    if (detaylar.gecerlilik_tarihi && !DataSanitizer.sanitizeDate(detaylar.gecerlilik_tarihi)) {
      errors.push('Geçersiz geçerlilik tarihi');
    }

    if (detaylar.randevu_tarihi && !DataSanitizer.sanitizeDate(detaylar.randevu_tarihi)) {
      errors.push('Geçersiz randevu tarihi');
    }

    // İzin verilmeyen alanları kontrol et
    const providedFields = Object.keys(detaylar);
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      errors.push(`İzin verilmeyen alanlar: ${invalidFields.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }
}

// 3. Data Integrity Checker
export class DataIntegrityChecker {
  
  // JSON boyut kontrolü
  static checkDataSize(data: any, maxSizeKB: number = 50): boolean {
    const jsonString = JSON.stringify(data);
    const sizeKB = Buffer.byteLength(jsonString, 'utf8') / 1024;
    return sizeKB <= maxSizeKB;
  }

  // Circular reference kontrolü
  static hasCircularReference(obj: any): boolean {
    const seen = new WeakSet();
    
    function detect(obj: any): boolean {
      if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return true;
        seen.add(obj);
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && detect(obj[key])) {
            return true;
          }
        }
      }
      return false;
    }
    
    return detect(obj);
  }

  // Nesne derinlik kontrolü
  static checkObjectDepth(obj: any, maxDepth: number = 10): boolean {
    function getDepth(obj: any, currentDepth: number = 0): number {
      if (currentDepth > maxDepth) return currentDepth;
      
      if (obj && typeof obj === 'object') {
        let maxChildDepth = currentDepth;
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const childDepth = getDepth(obj[key], currentDepth + 1);
            maxChildDepth = Math.max(maxChildDepth, childDepth);
          }
        }
        return maxChildDepth;
      }
      
      return currentDepth;
    }
    
    return getDepth(obj) <= maxDepth;
  }

  // Genel veri bütünlüğü kontrolü
  static validateDataIntegrity(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Boyut kontrolü
    if (!this.checkDataSize(data)) {
      errors.push('Veri boyutu çok büyük (max 50KB)');
    }

    // Circular reference kontrolü
    if (this.hasCircularReference(data)) {
      errors.push('Circular reference tespit edildi');
    }

    // Derinlik kontrolü
    if (!this.checkObjectDepth(data)) {
      errors.push('Veri yapısı çok derin (max 10 seviye)');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// 4. Rate Limiting Helper
export class RateLimiter {
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  static checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  static clearOldRecords(): void {
    const now = Date.now();
    for (const [key, record] of this.requestCounts) {
      if (now > record.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }
}