import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tarih formatlama fonksiyonu
 * @param date - Formatlanacak tarih (string, Date veya MongoDB BSON formatı)
 * @param options - Formatlama seçenekleri
 * @returns Formatlanmış tarih string'i
 */
export function formatDate(
  date: string | Date | unknown, 
  options?: {
    includeTime?: boolean;
    locale?: string;
  }
): string {
  if (!date) return 'Belirtilmemiş';
  
  try {
    let dateObj: Date;
    
    // MongoDB BSON formatı kontrolü
    if (date && typeof date === 'object' && date.$date) {
      dateObj = new Date(date.$date);
    } else {
      dateObj = new Date(date);
    }
    
    // Geçersiz tarih kontrolü
    if (isNaN(dateObj.getTime())) {
      return 'Geçersiz Tarih';
    }
    
    const locale = options?.locale || 'tr-TR';
    
    if (options?.includeTime) {
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Gün.Ay.Yıl formatında (01.01.2025)
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return `${day}.${month}.${year}`;
    }
  } catch (error) {
    console.error('Tarih formatlanırken hata:', error, date);
    return 'Tarih Hatası';
  }
}
