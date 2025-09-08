import { BaseResponse, PaginatedResponse } from './base.dto';
import { CustomerDto } from './customer.dto';

// Opportunity DTO'ları
export enum IslemTuruDto {
  CALISMA_IZNI = 'calisma_izni',
  IKAMET_IZNI = 'ikamet_izni',
  DIGER = 'diger'
}

export enum FirsatDurumuDto {
  BEKLEMEDE = 'beklemede',
  ISLEMDE = 'islemde',
  ONAYLANDI = 'onaylandi',
  REDDEDILDI = 'reddedildi',
  TAMAMLANDI = 'tamamlandi',
  IPTAL_EDILDI = 'iptal_edildi'
}

export enum ParaBirimiDto {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

export interface UcretDto {
  miktar: number;
  para_birimi: ParaBirimiDto;
  aciklama?: string;
  odeme_tarihi?: Date;
  odeme_durumu: 'toplam_ucret' | 'alinan_ucret' | 'gider';
}

export interface AciklamaDto {
  baslik: string;
  icerik: string;
  tarih: Date;
  yazan_kullanici?: string;
  onem_derecesi: 'dusuk' | 'orta' | 'yuksek';
}

export interface PdfDosyaDto {
  data: string;
  contentType: string;
  dosya_adi?: string;
  dosya_boyutu?: number;
  yuklenme_tarihi?: Date;
}

export interface OpportunityDto {
  _id?: string;
  musteri: CustomerDto | any; // CustomerDto veya populate edilmiş obje
  islem_turu: IslemTuruDto;
  durum: FirsatDurumuDto;
  olusturma_tarihi?: Date;
  guncelleme_tarihi?: Date;
  aciklamalar?: AciklamaDto[];
  ucretler?: UcretDto[];
  pdf_dosyalari?: PdfDosyaDto[]; // Birden fazla PDF dosyası
  detaylar?: any; // İşlem türüne özel detaylar (esnek yapı)
}

export interface CreateOpportunityDto {
  musteri_id: string;
  islem_turu: IslemTuruDto;
  detaylar?: any;
  aciklamalar?: AciklamaDto[];
  ucretler?: UcretDto[];
  pdf_dosyalari?: PdfDosyaDto[]; // Birden fazla PDF dosyası
  // Tarih bazlı sıralama kullanılır (olusturma_tarihi, guncelleme_tarihi)
}

// İşlem türüne özel Create DTO'ları
export interface CreateCalismaIzniDto extends Omit<CreateOpportunityDto, 'islem_turu' | 'detaylar'> {
  islem_turu: IslemTuruDto.CALISMA_IZNI;
  detaylar: {
    isveren: string;
    pozisyon: string;
    sozlesme_turu: string;
    maas: number;
    calisma_saati: number;
  };
}

export interface CreateIkametIzniDto extends Omit<CreateOpportunityDto, 'islem_turu' | 'detaylar'> {
  islem_turu: IslemTuruDto.IKAMET_IZNI;
  detaylar: {
    yapilan_islem: string;
    ikamet_turu: string;
    kayit_tarihi: string;
    kayit_numarasi: string;
    gecerlilik_tarihi?: string;
    randevu_tarihi?: string;
  };
}

export interface CreateDigerIslemDto extends Omit<CreateOpportunityDto, 'islem_turu' | 'detaylar'> {
  islem_turu: IslemTuruDto.DIGER;
  detaylar: {
    islem_adi: string;
    baslama_tarihi?: Date;
    bitis_tarihi?: Date;
  };
}

export interface UpdateOpportunityDto {
  durum?: FirsatDurumuDto;
  detaylar?: any;
  aciklamalar?: AciklamaDto[];
  ucretler?: UcretDto[];
  pdf_dosyalari?: PdfDosyaDto[]; // Birden fazla PDF dosyası
}

export interface OpportunityFilterDto {
  islem_turu?: IslemTuruDto;
  durum?: FirsatDurumuDto;
  musteri_id?: string;
  // Detaylar içindeki alanlar için genel arama
  search?: string; // isveren, kayit_numarasi, islem_adi vb. için
  date_from?: Date;
  date_to?: Date;
  // Tarih bazlı sıralama için sort_by ve sort_order eklendi
  sort_by?: 'olusturma_tarihi' | 'guncelleme_tarihi';
  sort_order?: 'asc' | 'desc';
  // Ödeme durumu filtresi
  payment_status?: 'toplam_ucret' | 'alinan_ucret' | 'gider';
}

// Sıra numarası DTO'ları kaldırıldı - Tarih bazlı sıralama kullanılacak

// Response DTO'ları
export interface OpportunityResponse extends BaseResponse<OpportunityDto> {}
export interface OpportunitiesResponse extends PaginatedResponse<OpportunityDto> {}