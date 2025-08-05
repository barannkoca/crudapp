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

// Ana Fırsat Interface'i (Supertype)
export interface IFirsat {
  _id?: string;
  musteri: ICustomer;
  islem_turu: IslemTuru;
  durum: FirsatDurumu;
  olusturma_tarihi?: Date;
  guncelleme_tarihi?: Date;
  
  // Yeni eklenen alanlar
  aciklamalar?: IAciklama[];
  ucretler?: IUcret[];
  genel_aciklama?: string;
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

// Çalışma İzni için özel alanlar
export interface ICalismaIzniFirsati extends IFirsat {
  islem_turu: IslemTuru.CALISMA_IZNI;
  // Çalışma izni özel alanları
  isveren?: string;
  pozisyon?: string;
  sozlesme_turu?: string;
  calisma_baslama_tarihi?: Date;
  calisma_bitis_tarihi?: Date;
  maas?: number;
  calisma_saati?: number;
  is_yeri_adresi?: string;
  is_yeri_telefonu?: string;
  calisma_aciklama?: string;
}

// İkamet İzni için özel alanlar (Record.ts ile eşleşen)
export interface IIkametIzniFirsati extends IFirsat {
  islem_turu: IslemTuru.IKAMET_IZNI;
  // İkamet izni özel alanları
  kayit_ili?: string;
  yapilan_islem?: string;
  ikamet_turu?: string;
  kayit_tarihi?: string;
  kayit_numarasi?: string;
  aciklama?: string;
  gecerlilik_tarihi?: string;
  sira_no?: number;
  randevu_tarihi?: string;
  kayit_pdf?: {
    data: string;
    contentType: string;
  };
}

// Diğer İşlemler için özel alanlar
export interface IDigerFirsati extends IFirsat {
  islem_turu: IslemTuru.DIGER;
  // Diğer işlem özel alanları
  islem_adi?: string;
  diger_baslama_tarihi?: Date;
  diger_bitis_tarihi?: Date;
  diger_aciklama?: string;
  ek_bilgiler?: string;
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
  genel_aciklama?: string;
}

// Fırsat güncelleme için interface
export interface IFirsatGuncelle {
  durum?: FirsatDurumu;
  detaylar?: any;
  aciklamalar?: IAciklama[];
  ucretler?: IUcret[];
  genel_aciklama?: string;
} 