export interface ICustomer {
  _id?: string;
  ad: string;
  soyad: string;
  yabanci_kimlik_no?: string;
  uyrugu?: string;
  cinsiyeti: "Erkek" | "Kadın";
  telefon_no?: string;
  eposta?: string;
  dogum_tarihi?: Date;
  adres?: string;
  photo?: {
    data?: string;
    contentType?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomerCreate {
  ad: string;
  soyad: string;
  yabanci_kimlik_no?: string;
  uyrugu?: string;
  cinsiyeti: "Erkek" | "Kadın";
  telefon_no?: string;
  eposta?: string;
  dogum_tarihi?: Date;
  adres?: string;
  photo?: {
    data?: string;
    contentType?: string;
  };
}

export interface ICustomerUpdate {
  ad?: string;
  soyad?: string;
  yabanci_kimlik_no?: string;
  uyrugu?: string;
  cinsiyeti?: "Erkek" | "Kadın";
  telefon_no?: string;
  eposta?: string;
  dogum_tarihi?: Date;
  adres?: string;
  photo?: {
    data?: string;
    contentType?: string;
  };
} 