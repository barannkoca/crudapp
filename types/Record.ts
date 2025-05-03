export interface Record {
  _id: string;
  kayit_ili: string;
  yapilan_islem: string;
  ikamet_turu: string;
  kayit_tarihi: string;
  kayit_numarasi: string;
  adi: string;
  soyadi: string;
  cinsiyeti: string;
  durum: string;
  createdAt: string;
  gecerlilik_tarihi?: string;
  randevu_tarihi?: string;
  telefon_no?: string;
  eposta?: string;
  yabanci_kimlik_no?: string;
  belge_no?: string;
  photo?: {
    data: string;
    contentType: string;
  };
  kayit_pdf?: {
    data: string;
    contentType: string;
  };
  user: {
    _id: string;
    name: string;
  } | string;
  corporate: string;
  sira_no?: number;
} 