import { ICustomer } from './Customer';

export interface IRecord {
  _id?: string;
  // Müşteri referansı (yeni)
  musteri: ICustomer;
  // İşlem türü (yeni)
  islem_turu: 'kayit';
  // Durum (güncellendi)
  durum: 'beklemede' | 'islemde' | 'onaylandi' | 'reddedildi' | 'tamamlandi' | 'iptal_edildi';
  // İkamet izni detayları
  kayit_ili: string;
  yapilan_islem: string;
  ikamet_turu: string;
  kayit_tarihi: string;
  kayit_numarasi: string;
  aciklama?: string;
  gecerlilik_tarihi?: string;
  sira_no?: number;
  randevu_tarihi?: string;
  // PDF belgesi
  kayit_pdf?: {
    data: string;
    contentType: string;
  };
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Record oluşturma için interface
export interface IRecordCreate {
  musteri_id: string;
  kayit_ili: string;
  yapilan_islem: string;
  ikamet_turu: string;
  kayit_tarihi: string;
  kayit_numarasi: string;
  aciklama?: string;
  gecerlilik_tarihi?: string;
  sira_no?: number;
  randevu_tarihi?: string;
  kayit_pdf?: {
    data: string;
    contentType: string;
  };
}

// Record güncelleme için interface
export interface IRecordUpdate {
  durum?: 'beklemede' | 'islemde' | 'onaylandi' | 'reddedildi' | 'tamamlandi' | 'iptal_edildi';
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