import { ICustomer } from './Customer';

// Para birimi enum'u
export enum ParaBirimi {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// Ücret entity'si
export interface IUcret {
  miktar: number;
  para_birimi: ParaBirimi;
  aciklama?: string;
  odeme_tarihi?: Date;
  odeme_durumu: 'beklemede' | 'odendi' | 'iptal_edildi';
}

// Açıklama entity'si
export interface IAciklama {
  baslik: string;
  icerik: string;
  tarih: Date;
  yazan_kullanici?: string;
  onem_derecesi: 'dusuk' | 'orta' | 'yuksek';
}

// PDF dosyası interface'i
export interface IPdfDosya {
  data: string;
  contentType: string;
  dosya_adi?: string;
  dosya_boyutu?: number;
  yuklenme_tarihi?: Date;
}

// Ana Fırsat Interface'i (Supertype)
export interface IFirsat {
  _id?: string;
  musteri?: ICustomer | any; // Müşteri bilgileri - populate edilmiş veya sadece ID
  islem_turu: IslemTuru;
  durum: FirsatDurumu;
  olusturma_tarihi?: Date;
  guncelleme_tarihi?: Date;
  
  // Ortak alanlar
  aciklamalar?: IAciklama[];
  ucretler?: IUcret[];
  pdf_dosyalari?: IPdfDosya[]; // Birden fazla PDF dosyası
  
  // İşlem türüne özel detaylar (esnek yapı)
  detaylar?: any;
}

// İşlem Türleri
export enum IslemTuru {
  CALISMA_IZNI = 'calisma_izni',
  IKAMET_IZNI = 'ikamet_izni',
  DIGER = 'diger'
}

// Fırsat Durumları
export enum FirsatDurumu {
  BEKLEMEDE = 'beklemede',
  ISLEMDE = 'islemde',
  ONAYLANDI = 'onaylandi',
  REDDEDILDI = 'reddedildi',
  TAMAMLANDI = 'tamamlandi',
  IPTAL_EDILDI = 'iptal_edildi'
}

// Çalışma İzni için özel alanlar (detaylar içinde)
export interface ICalismaIzniFirsati extends IFirsat {
  islem_turu: IslemTuru.CALISMA_IZNI;
  detaylar?: {
    isveren?: string;
    pozisyon?: string;
    kayit_tarihi?: string | Date;
    calisma_izni_bitis_tarihi?: string | Date;
    is_baslama_tarihi?: Date;
    notlar?: string;
  };
}

// İkamet İzni için özel alanlar (detaylar içinde - kayit_ili kaldırıldı)
export interface IIkametIzniFirsati extends IFirsat {
  islem_turu: IslemTuru.IKAMET_IZNI;
  detaylar?: {
    yapilan_islem?: string;
    ikamet_turu?: string;
    kayit_tarihi?: string | Date;
    kayit_numarasi?: string;
    gecerlilik_tarihi?: string | Date;
    randevu_tarihi?: string | Date;
    notlar?: string;
  };
}

// Diğer İşlemler için özel alanlar (detaylar içinde)
export interface IDigerFirsati extends IFirsat {
  islem_turu: IslemTuru.DIGER;
  detaylar?: {
    islem_adi?: string;
    islem_durumu?: string;
    baslama_tarihi?: Date;
    bitis_tarihi?: Date;
    aciklama?: string;
    notlar?: string;
  };
}

// Union type - Tüm fırsat türleri
export type FirsatTuru = 
  | ICalismaIzniFirsati
  | IIkametIzniFirsati
  | IDigerFirsati;

// Fırsat oluşturma için interface
export interface IFirsatOlustur {
  musteri_id: string;
  islem_turu: IslemTuru;
  detaylar: any; // İşlem türüne göre değişir
  aciklamalar?: IAciklama[];
  ucretler?: IUcret[];
  pdf_dosyalari?: IPdfDosya[]; // Birden fazla PDF dosyası
}

// Fırsat güncelleme için interface
export interface IFirsatGuncelle {
  durum?: FirsatDurumu;
  detaylar?: any;
  aciklamalar?: IAciklama[];
  ucretler?: IUcret[];
  pdf_dosyalari?: IPdfDosya[]; // Birden fazla PDF dosyası
} 