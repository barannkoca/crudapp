export interface Record {
  _id: string;
  kayit_ili: string;
  yapilan_islem: string;
  kayit_tarihi: string;
  kayit_numarasi: string;
  adi: string;
  soyadi: string;
  cinsiyeti: string;
  durum: string;
  createdAt: string;
  gecerlilik_tarihi?: string;
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
} 