import { BaseRepository } from '../repositories/base.repository';
import { BaseResponse, PaginatedResponse, PaginationParams } from '../dto/base.dto';
import { Document } from 'mongoose';

// Base Service sınıfı - tüm servisler için ortak operasyonlar
export abstract class BaseService<T extends Document, TDto, TCreateDto, TUpdateDto> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  // Pagination hesaplama yardımcı metodu
  protected calculatePagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }

  // Success response oluşturma
  protected createSuccessResponse<TData>(data: TData, message?: string): BaseResponse<TData> {
    return {
      success: true,
      data,
      message
    };
  }

  // Paginated response oluşturma
  protected createPaginatedResponse<TData>(
    data: TData[], 
    pagination: PaginationParams & { total: number },
    message?: string
  ): PaginatedResponse<TData> {
    return {
      success: true,
      data,
      pagination: this.calculatePagination(pagination.page, pagination.limit, pagination.total),
      message
    };
  }

  // Error response oluşturma
  protected createErrorResponse(error: string): BaseResponse {
    return {
      success: false,
      error
    };
  }

  // Tekil kayıt getir
  async getById(id: string): Promise<BaseResponse<TDto>> {
    try {
      const result = await this.repository.findById(id);
      if (!result) {
        return this.createErrorResponse('Kayıt bulunamadı');
      }
      return this.createSuccessResponse(this.mapToDto(result));
    } catch (error) {
      console.error(`${this.constructor.name} getById error:`, error);
      return this.createErrorResponse('Kayıt getirilemedi');
    }
  }

  // Kayıt oluştur
  async create(createDto: TCreateDto): Promise<BaseResponse<TDto>> {
    try {
      const validationResult = await this.validateCreate(createDto);
      if (!validationResult.isValid) {
        return this.createErrorResponse(validationResult.errors.map(e => e.message).join(', '));
      }

      const data = await this.mapCreateDtoToEntity(createDto);
      const result = await this.repository.create(data);
      return this.createSuccessResponse(this.mapToDto(result), 'Kayıt başarıyla oluşturuldu');
    } catch (error) {
      console.error(`${this.constructor.name} create error:`, error);
      return this.createErrorResponse('Kayıt oluşturulamadı');
    }
  }

  // Kayıt güncelle
  async update(id: string, updateDto: TUpdateDto): Promise<BaseResponse<TDto>> {
    try {
      const validationResult = await this.validateUpdate(updateDto, id);
      if (!validationResult.isValid) {
        return this.createErrorResponse(validationResult.errors.map(e => e.message).join(', '));
      }

      const data = await this.mapUpdateDtoToEntity(updateDto);
      const result = await this.repository.update(id, data);
      if (!result) {
        return this.createErrorResponse('Kayıt bulunamadı');
      }
      return this.createSuccessResponse(this.mapToDto(result), 'Kayıt başarıyla güncellendi');
    } catch (error) {
      console.error(`${this.constructor.name} update error:`, error);
      return this.createErrorResponse('Kayıt güncellenemedi');
    }
  }

  // Kayıt sil
  async delete(id: string): Promise<BaseResponse<boolean>> {
    try {
      const result = await this.repository.delete(id);
      if (!result) {
        return this.createErrorResponse('Kayıt bulunamadı');
      }
      return this.createSuccessResponse(true, 'Kayıt başarıyla silindi');
    } catch (error) {
      console.error(`${this.constructor.name} delete error:`, error);
      return this.createErrorResponse('Kayıt silinemedi');
    }
  }

  // Kayıt sayısı
  async count(filter?: any): Promise<BaseResponse<number>> {
    try {
      const count = await this.repository.count(filter);
      return this.createSuccessResponse(count);
    } catch (error) {
      console.error(`${this.constructor.name} count error:`, error);
      return this.createErrorResponse('Sayım alınamadı');
    }
  }

  // Abstract metodlar - alt sınıflar tarafından implement edilmeli
  protected abstract mapToDto(entity: T): TDto;
  protected abstract mapCreateDtoToEntity(createDto: TCreateDto): Promise<Partial<T>> | Partial<T>;
  protected abstract mapUpdateDtoToEntity(updateDto: TUpdateDto): Promise<Partial<T>> | Partial<T>;
  protected abstract validateCreate(createDto: TCreateDto): Promise<{ isValid: boolean; errors: any[] }>;
  protected abstract validateUpdate(updateDto: TUpdateDto, existingId?: string): Promise<{ isValid: boolean; errors: any[] }>;
}