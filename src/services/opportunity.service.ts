import { BaseService } from './base.service';
import { OpportunityRepository } from '../repositories/opportunity.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { 
  OpportunityDto, 
  CreateOpportunityDto, 
  UpdateOpportunityDto, 
  OpportunityFilterDto,
  OpportunitiesResponse,
  IslemTuruDto
} from '../dto/opportunity.dto';
import { BaseResponse, PaginationParams } from '../dto/base.dto';

import { Document } from 'mongoose';

interface IOpportunityDoc extends Document {
  _id: string;
  musteri: any;
  islem_turu: string;
  durum: string;
  olusturma_tarihi: Date;
  guncelleme_tarihi: Date;
  [key: string]: any;
}

export class OpportunityService extends BaseService<IOpportunityDoc, OpportunityDto, CreateOpportunityDto, UpdateOpportunityDto> {
  private opportunityRepository: OpportunityRepository;
  private customerRepository: CustomerRepository;

  constructor() {
    const repository = new OpportunityRepository();
    super(repository);
    this.opportunityRepository = repository;
    this.customerRepository = new CustomerRepository();
  }

  // Opportunity'e özel metodlar

  // Filtreleme ile fırsat listesi
  async getOpportunitiesByFilters(
    filters: OpportunityFilterDto, 
    pagination: PaginationParams
  ): Promise<OpportunitiesResponse> {
    try {
      const { data, total } = await this.opportunityRepository.findByFilters(filters, pagination);
      const opportunities = data.map(this.mapToDto.bind(this));
      
      return this.createPaginatedResponse(opportunities, { ...pagination, total });
    } catch (error) {
      console.error('Opportunity filter error:', error);
      return this.createErrorResponse('Fırsatlar getirilemedi') as OpportunitiesResponse;
    }
  }

  // Müşteriye ait fırsatlar
  async getOpportunitiesByCustomer(
    customerId: string, 
    pagination: PaginationParams
  ): Promise<OpportunitiesResponse> {
    try {
      const { data, total } = await this.opportunityRepository.findByCustomer(customerId, pagination);
      const opportunities = data.map(this.mapToDto.bind(this));
      
      return this.createPaginatedResponse(opportunities, { ...pagination, total });
    } catch (error) {
      console.error('Customer opportunities error:', error);
      return this.createErrorResponse('Müşteri fırsatları getirilemedi') as OpportunitiesResponse;
    }
  }

  // Sıra numarası ile fırsat bul
  // getOpportunityBySiraNo metodu kaldırıldı - Tarih bazlı sıralama kullanılacak

  // getNextSiraNo metodu kaldırıldı

  // Fırsat istatistikleri
  async getOpportunityStats(): Promise<BaseResponse<any>> {
    try {
      const stats = await this.opportunityRepository.getStats();
      return this.createSuccessResponse(stats);
    } catch (error) {
      console.error('Opportunity stats error:', error);
      return this.createErrorResponse('İstatistikler alınamadı');
    }
  }

  // Ödeme istatistikleri
  async getPaymentStats(): Promise<BaseResponse<any>> {
    try {
      const stats = await this.opportunityRepository.getPaymentStats();
      return this.createSuccessResponse(stats);
    } catch (error) {
      console.error('Payment stats error:', error);
      return this.createErrorResponse('Ödeme istatistikleri alınamadı');
    }
  }

  // Sıra numarası istatistik metodları kaldırıldı - Tarih bazlı sıralama kullanılacak

  // Fırsat oluştur (özelleştirilmiş)
  async createOpportunity(createDto: CreateOpportunityDto): Promise<BaseResponse<OpportunityDto>> {
    try {
      const validationResult = await this.validateCreate(createDto);
      if (!validationResult.isValid) {
        return this.createErrorResponse(validationResult.errors.map(e => e.message).join(', '));
      }

      // Sıra numarası ataması kaldırıldı - Tarih bazlı sıralama kullanılacak

      const data = await this.mapCreateDtoToEntity(createDto);
      const result = await this.opportunityRepository.create(data);
      
      // Müşteri bilgilerini populate et
      const populatedResult = await this.opportunityRepository.findById(result._id, 'musteri');
      
      return this.createSuccessResponse(this.mapToDto(populatedResult!), 'Fırsat başarıyla oluşturuldu');
    } catch (error) {
      console.error('Create opportunity error:', error);
      return this.createErrorResponse('Fırsat oluşturulamadı');
    }
  }

  // Validation metodları
  protected async validateCreate(createDto: CreateOpportunityDto): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Zorunlu alanlar
    if (!createDto.musteri_id) {
      errors.push({ field: 'musteri_id', message: 'Müşteri ID zorunludur' });
    }
    if (!createDto.islem_turu) {
      errors.push({ field: 'islem_turu', message: 'İşlem türü zorunludur' });
    }

    // Müşteri var mı kontrolü
    if (createDto.musteri_id) {
      const customer = await this.customerRepository.findById(createDto.musteri_id);
      if (!customer) {
        errors.push({ field: 'musteri_id', message: 'Geçersiz müşteri ID' });
      }
    }

    // İşlem türüne özel validasyonlar
    if (createDto.islem_turu === IslemTuruDto.CALISMA_IZNI) {
      if (!createDto.detaylar) {
        errors.push({ field: 'detaylar', message: 'Çalışma izni detayları zorunludur' });
      } else {
        if (!createDto.detaylar.isveren) {
          errors.push({ field: 'detaylar.isveren', message: 'İşveren bilgisi zorunludur' });
        }
        if (!createDto.detaylar.pozisyon) {
          errors.push({ field: 'detaylar.pozisyon', message: 'Pozisyon bilgisi zorunludur' });
        }
        if (!createDto.detaylar.sozlesme_turu) {
          errors.push({ field: 'detaylar.sozlesme_turu', message: 'Sözleşme türü zorunludur' });
        }
        if (!createDto.detaylar.maas || createDto.detaylar.maas <= 0) {
          errors.push({ field: 'detaylar.maas', message: 'Geçerli bir maaş bilgisi zorunludur' });
        }
        if (!createDto.detaylar.calisma_saati || createDto.detaylar.calisma_saati <= 0) {
          errors.push({ field: 'detaylar.calisma_saati', message: 'Geçerli bir çalışma saati bilgisi zorunludur' });
        }
      }
    }

    if (createDto.islem_turu === IslemTuruDto.IKAMET_IZNI) {
      if (!createDto.detaylar) {
        errors.push({ field: 'detaylar', message: 'İkamet izni detayları zorunludur' });
      } else {
        if (!createDto.detaylar.yapilan_islem) {
          errors.push({ field: 'detaylar.yapilan_islem', message: 'Yapılan işlem bilgisi zorunludur' });
        }
        if (!createDto.detaylar.ikamet_turu) {
          errors.push({ field: 'detaylar.ikamet_turu', message: 'İkamet türü zorunludur' });
        }
        if (!createDto.detaylar.kayit_tarihi) {
          errors.push({ field: 'detaylar.kayit_tarihi', message: 'Kayıt tarihi zorunludur' });
        }
        if (!createDto.detaylar.kayit_numarasi) {
          errors.push({ field: 'detaylar.kayit_numarasi', message: 'Kayıt numarası zorunludur' });
        }
      }
    }

    if (createDto.islem_turu === IslemTuruDto.DIGER) {
      if (!createDto.detaylar) {
        errors.push({ field: 'detaylar', message: 'İşlem detayları zorunludur' });
      } else {
        if (!createDto.detaylar.islem_adi) {
          errors.push({ field: 'detaylar.islem_adi', message: 'İşlem adı zorunludur' });
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  protected async validateUpdate(updateDto: UpdateOpportunityDto): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Durum kontrolü
    if (updateDto.durum && !['beklemede', 'islemde', 'onaylandi', 'reddedildi', 'tamamlandi', 'iptal_edildi'].includes(updateDto.durum)) {
      errors.push({ field: 'durum', message: 'Geçersiz durum değeri' });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Mapping metodları
  protected mapToDto(entity: IOpportunityDoc): OpportunityDto {
    return {
      _id: entity._id?.toString(),
      musteri: entity.musteri,
      islem_turu: entity.islem_turu as IslemTuruDto,
      durum: entity.durum as any,
      olusturma_tarihi: entity.olusturma_tarihi,
      guncelleme_tarihi: entity.guncelleme_tarihi,
      aciklamalar: entity.aciklamalar,
      ucretler: entity.ucretler,
      pdf_dosya: entity.pdf_dosya,
      detaylar: entity.detaylar || {}
    };
  }

  protected async mapCreateDtoToEntity(createDto: CreateOpportunityDto): Promise<Partial<IOpportunityDoc>> {
    const entity: Partial<IOpportunityDoc> = {
      musteri: createDto.musteri_id,
      islem_turu: createDto.islem_turu,
      durum: 'beklemede',
      detaylar: createDto.detaylar,
      aciklamalar: createDto.aciklamalar || [],
      ucretler: createDto.ucretler || [],
      pdf_dosya: createDto.pdf_dosya,
      olusturma_tarihi: new Date(),
      guncelleme_tarihi: new Date()
    };

    // İşlem türüne göre özel alanları set et
    if (createDto.islem_turu === IslemTuruDto.CALISMA_IZNI && createDto.detaylar) {
      entity.isveren = createDto.detaylar.isveren;
      entity.pozisyon = createDto.detaylar.pozisyon;
      entity.sozlesme_turu = createDto.detaylar.sozlesme_turu;
      entity.maas = createDto.detaylar.maas;
      entity.calisma_saati = createDto.detaylar.calisma_saati;
      entity.sira_no = createDto.detaylar.sira_no;
    }

    if (createDto.islem_turu === IslemTuruDto.IKAMET_IZNI && createDto.detaylar) {
      entity.kayit_ili = createDto.detaylar.kayit_ili;
      entity.yapilan_islem = createDto.detaylar.yapilan_islem;
      entity.ikamet_turu = createDto.detaylar.ikamet_turu;
      entity.kayit_tarihi = createDto.detaylar.kayit_tarihi;
      entity.kayit_numarasi = createDto.detaylar.kayit_numarasi;
      entity.aciklama = createDto.detaylar.aciklama;
      entity.gecerlilik_tarihi = createDto.detaylar.gecerlilik_tarihi;
      entity.sira_no = createDto.detaylar.sira_no;
      entity.randevu_tarihi = createDto.detaylar.randevu_tarihi;
    }

    if (createDto.islem_turu === IslemTuruDto.DIGER && createDto.detaylar) {
      entity.islem_adi = createDto.detaylar.islem_adi;
      entity.diger_baslama_tarihi = createDto.detaylar.diger_baslama_tarihi;
      entity.diger_bitis_tarihi = createDto.detaylar.diger_bitis_tarihi;
      entity.diger_aciklama = createDto.detaylar.diger_aciklama;
      entity.ek_bilgiler = createDto.detaylar.ek_bilgiler;
      entity.sira_no = createDto.detaylar.sira_no;
    }

    return entity;
  }

  protected mapUpdateDtoToEntity(updateDto: UpdateOpportunityDto): Partial<IOpportunityDoc> {
    const entity: Partial<IOpportunityDoc> = {
      guncelleme_tarihi: new Date()
    };

    if (updateDto.durum !== undefined) entity.durum = updateDto.durum;
    if (updateDto.detaylar !== undefined) entity.detaylar = updateDto.detaylar;
    if (updateDto.aciklamalar !== undefined) entity.aciklamalar = updateDto.aciklamalar;
    if (updateDto.ucretler !== undefined) entity.ucretler = updateDto.ucretler;
    if (updateDto.pdf_dosya !== undefined) entity.pdf_dosya = updateDto.pdf_dosya;

    return entity;
  }
}