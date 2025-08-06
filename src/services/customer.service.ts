import { BaseService } from './base.service';
import { CustomerRepository } from '../repositories/customer.repository';
import { 
  CustomerDto, 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  CustomerFilterDto,
  CustomersResponse,
  CustomerSelectResponse
} from '../dto/customer.dto';
import { BaseResponse, PaginationParams } from '../dto/base.dto';
import { ICustomer } from '@/types/Customer';
import { Document } from 'mongoose';

interface ICustomerDoc extends Omit<ICustomer, '_id'>, Document {}

export class CustomerService extends BaseService<ICustomerDoc, CustomerDto, CreateCustomerDto, UpdateCustomerDto> {
  private customerRepository: CustomerRepository;

  constructor() {
    const repository = new CustomerRepository();
    super(repository);
    this.customerRepository = repository;
  }

  // Customer'a özel metodlar

  // Müşteri arama
  async searchCustomers(
    searchTerm: string, 
    pagination: PaginationParams
  ): Promise<CustomersResponse> {
    try {
      const { data, total } = await this.customerRepository.searchCustomers(searchTerm, pagination);
      const customers = data.map(this.mapToDto.bind(this));
      
      return this.createPaginatedResponse(customers, { ...pagination, total }, 'Arama tamamlandı');
    } catch (error) {
      console.error('Customer search error:', error);
      return this.createErrorResponse('Arama yapılamadı') as CustomersResponse;
    }
  }

  // Filtreleme ile müşteri listesi
  async getCustomersByFilters(
    filters: CustomerFilterDto, 
    pagination: PaginationParams
  ): Promise<CustomersResponse> {
    try {
      const { data, total } = await this.customerRepository.findByFilters(filters, pagination);
      const customers = data.map(this.mapToDto.bind(this));
      
      return this.createPaginatedResponse(customers, { ...pagination, total });
    } catch (error) {
      console.error('Customer filter error:', error);
      return this.createErrorResponse('Müşteriler getirilemedi') as CustomersResponse;
    }
  }

  // Select için müşteri listesi
  async getCustomersForSelect(): Promise<CustomerSelectResponse> {
    try {
      const customers = await this.customerRepository.findForSelect();
      return this.createSuccessResponse(customers);
    } catch (error) {
      console.error('Customer select error:', error);
      return this.createErrorResponse('Müşteri listesi alınamadı');
    }
  }

  // Kimlik numarası ile müşteri bul
  async getCustomerByKimlikNo(kimlikNo: string): Promise<BaseResponse<CustomerDto>> {
    try {
      const customer = await this.customerRepository.findByKimlikNo(kimlikNo);
      if (!customer) {
        return this.createErrorResponse('Müşteri bulunamadı');
      }
      return this.createSuccessResponse(this.mapToDto(customer));
    } catch (error) {
      console.error('Customer kimlik no error:', error);
      return this.createErrorResponse('Müşteri getirilemedi');
    }
  }

  // Email ile müşteri bul
  async getCustomerByEmail(email: string): Promise<BaseResponse<CustomerDto>> {
    try {
      const customer = await this.customerRepository.findByEmail(email);
      if (!customer) {
        return this.createErrorResponse('Müşteri bulunamadı');
      }
      return this.createSuccessResponse(this.mapToDto(customer));
    } catch (error) {
      console.error('Customer email error:', error);
      return this.createErrorResponse('Müşteri getirilemedi');
    }
  }

  // Müşteri istatistikleri
  async getCustomerStats(): Promise<BaseResponse<any>> {
    try {
      const stats = await this.customerRepository.getStats();
      return this.createSuccessResponse(stats);
    } catch (error) {
      console.error('Customer stats error:', error);
      return this.createErrorResponse('İstatistikler alınamadı');
    }
  }

  // Validation metodları
  protected async validateCreate(createDto: CreateCustomerDto): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Zorunlu alanlar
    if (!createDto.ad?.trim()) {
      errors.push({ field: 'ad', message: 'Ad alanı zorunludur' });
    }
    if (!createDto.soyad?.trim()) {
      errors.push({ field: 'soyad', message: 'Soyad alanı zorunludur' });
    }
    if (!createDto.cinsiyeti) {
      errors.push({ field: 'cinsiyeti', message: 'Cinsiyet alanı zorunludur' });
    }

    // Email formatı kontrolü
    if (createDto.eposta && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createDto.eposta)) {
      errors.push({ field: 'eposta', message: 'Geçerli bir email adresi girin' });
    }

    // Telefon formatı kontrolü
    if (createDto.telefon_no && !/^\d{10,}$/.test(createDto.telefon_no)) {
      errors.push({ field: 'telefon_no', message: 'Geçerli bir telefon numarası girin (en az 10 haneli)' });
    }

    // Benzersizlik kontrolleri
    if (createDto.yabanci_kimlik_no) {
      const existingByKimlik = await this.customerRepository.findByKimlikNo(createDto.yabanci_kimlik_no);
      if (existingByKimlik) {
        errors.push({ field: 'yabanci_kimlik_no', message: 'Bu kimlik numarası zaten kayıtlı' });
      }
    }

    if (createDto.eposta) {
      const existingByEmail = await this.customerRepository.findByEmail(createDto.eposta);
      if (existingByEmail) {
        errors.push({ field: 'eposta', message: 'Bu email adresi zaten kayıtlı' });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  protected async validateUpdate(updateDto: UpdateCustomerDto): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Email formatı kontrolü
    if (updateDto.eposta && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateDto.eposta)) {
      errors.push({ field: 'eposta', message: 'Geçerli bir email adresi girin' });
    }

    // Telefon formatı kontrolü
    if (updateDto.telefon_no && !/^\d{10,}$/.test(updateDto.telefon_no)) {
      errors.push({ field: 'telefon_no', message: 'Geçerli bir telefon numarası girin (en az 10 haneli)' });
    }

    // İsim kontrolleri
    if (updateDto.ad !== undefined && !updateDto.ad?.trim()) {
      errors.push({ field: 'ad', message: 'Ad alanı boş olamaz' });
    }
    if (updateDto.soyad !== undefined && !updateDto.soyad?.trim()) {
      errors.push({ field: 'soyad', message: 'Soyad alanı boş olamaz' });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Mapping metodları
  protected mapToDto(entity: ICustomerDoc): CustomerDto {
    return {
      _id: entity._id?.toString(),
      ad: entity.ad,
      soyad: entity.soyad,
      yabanci_kimlik_no: entity.yabanci_kimlik_no,
      uyrugu: entity.uyrugu,
      cinsiyeti: entity.cinsiyeti,
      telefon_no: entity.telefon_no,
      eposta: entity.eposta,
      photo: entity.photo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  protected mapCreateDtoToEntity(createDto: CreateCustomerDto): Partial<ICustomerDoc> {
    return {
      ad: createDto.ad.trim(),
      soyad: createDto.soyad.trim(),
      yabanci_kimlik_no: createDto.yabanci_kimlik_no?.trim() || undefined,
      uyrugu: createDto.uyrugu?.trim() || undefined,
      cinsiyeti: createDto.cinsiyeti,
      telefon_no: createDto.telefon_no?.trim() || undefined,
      eposta: createDto.eposta?.trim().toLowerCase() || undefined,
      photo: createDto.photo
    };
  }

  protected mapUpdateDtoToEntity(updateDto: UpdateCustomerDto): Partial<ICustomerDoc> {
    const entity: Partial<ICustomerDoc> = {};

    if (updateDto.ad !== undefined) entity.ad = updateDto.ad.trim();
    if (updateDto.soyad !== undefined) entity.soyad = updateDto.soyad.trim();
    if (updateDto.yabanci_kimlik_no !== undefined) entity.yabanci_kimlik_no = updateDto.yabanci_kimlik_no?.trim() || undefined;
    if (updateDto.uyrugu !== undefined) entity.uyrugu = updateDto.uyrugu?.trim() || undefined;
    if (updateDto.cinsiyeti !== undefined) entity.cinsiyeti = updateDto.cinsiyeti;
    if (updateDto.telefon_no !== undefined) entity.telefon_no = updateDto.telefon_no?.trim() || undefined;
    if (updateDto.eposta !== undefined) entity.eposta = updateDto.eposta?.trim().toLowerCase() || undefined;
    if (updateDto.photo !== undefined) entity.photo = updateDto.photo;

    return entity;
  }
}