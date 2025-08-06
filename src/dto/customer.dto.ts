import { BaseResponse, PaginatedResponse } from './base.dto';

// Customer DTO'ları
export interface CustomerDto {
  _id?: string;
  ad: string;
  soyad: string;
  yabanci_kimlik_no?: string;
  uyrugu?: string;
  cinsiyeti: "Erkek" | "Kadın";
  telefon_no?: string;
  eposta?: string;
  photo?: {
    data?: string;
    contentType?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCustomerDto {
  ad: string;
  soyad: string;
  yabanci_kimlik_no?: string;
  uyrugu?: string;
  cinsiyeti: "Erkek" | "Kadın";
  telefon_no?: string;
  eposta?: string;
  photo?: {
    data?: string;
    contentType?: string;
  };
}

export interface UpdateCustomerDto {
  ad?: string;
  soyad?: string;
  yabanci_kimlik_no?: string;
  uyrugu?: string;
  cinsiyeti?: "Erkek" | "Kadın";
  telefon_no?: string;
  eposta?: string;
  photo?: {
    data?: string;
    contentType?: string;
  };
}

export interface CustomerFilterDto {
  ad?: string;
  soyad?: string;
  yabanci_kimlik_no?: string;
  uyrugu?: string;
  cinsiyeti?: "Erkek" | "Kadın";
  telefon_no?: string;
  eposta?: string;
  search?: string; // Genel arama için
}

// Response DTO'ları
export interface CustomerResponse extends BaseResponse<CustomerDto> {}
export interface CustomersResponse extends PaginatedResponse<CustomerDto> {}
export interface CustomerSelectResponse extends BaseResponse<Array<{_id: string, ad: string, soyad: string}>> {}