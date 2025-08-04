import { ICustomer } from './Customer';

// Ana Fırsat Interface'i
export interface IFirsat {
  _id?: string;
  musteri: ICustomer; // Mevcut müşteri referansı
  islem_turu: IslemTuru;
  durum: FirsatDurumu;
  olusturma_tarihi?: Date;
  guncelleme_tarihi?: Date;
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

// Çalışma İzni için özel interface
export interface ICalismaIzniFirsati extends IFirsat {
  islem_turu: IslemTuru.CALISMA_IZNI;
  calisma_izni_detaylari: {
    isveren: string;
    pozisyon: string;
    sozlesme_turu: string;
    baslama_tarihi: Date;
    bitis_tarihi?: Date;
    maas?: number;
    calisma_saati?: number;
    is_yeri_adresi?: string;
    is_yeri_telefonu?: string;
    aciklama?: string;
  };
}

// İkamet İzni için özel interface
export interface IIkametIzniFirsati extends IFirsat {
  islem_turu: IslemTuru.IKAMET_IZNI;
  ikamet_izni_detaylari: {
    ikamet_izni_turu: string;
    baslama_tarihi: Date;
    bitis_tarihi?: Date;
    ikamet_sebebi: string;
    adres: string;
    aciklama?: string;
  };
}

// Diğer İşlemler için özel interface
export interface IDigerFirsati extends IFirsat {
  islem_turu: IslemTuru.DIGER;
  diger_detaylari: {
    islem_adi: string;
    baslama_tarihi: Date;
    bitis_tarihi?: Date;
    aciklama?: string;
    ek_bilgiler?: string;
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
}

// Fırsat güncelleme için interface
export interface IFirsatGuncelle {
  durum?: FirsatDurumu;
  detaylar?: any;
} 