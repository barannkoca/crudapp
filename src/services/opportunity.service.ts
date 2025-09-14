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
import { 
  DataSanitizer, 
  SchemaValidator, 
  DataIntegrityChecker,
  RateLimiter
} from '../utils/data-integrity.utils';

import { Document } from 'mongoose';

interface IOpportunityDoc extends Document {
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

  // Override getById - müşteri bilgilerini populate et
  async getById(id: string): Promise<BaseResponse<OpportunityDto>> {
    try {
      const result = await this.opportunityRepository.findById(id, 'musteri');
      if (!result) {
        return this.createErrorResponse('Fırsat bulunamadı');
      }
      return this.createSuccessResponse(this.mapToDto(result), 'Fırsat başarıyla getirildi');
    } catch (error) {
      console.error('Opportunity getById error:', error);
      return this.createErrorResponse('Fırsat getirilemedi');
    }
  }

  // Filtreleme ile fırsat listesi
  async getOpportunitiesByFilters(
    filters: OpportunityFilterDto, 
    pagination: PaginationParams
  ): Promise<OpportunitiesResponse> {
    try {
      const { data, total } = await this.opportunityRepository.findByFilters(filters, pagination);
      const opportunities = data.map(this.mapToDto.bind(this));
      
      return this.createPaginatedResponse(opportunities, { ...pagination, total }) as OpportunitiesResponse;
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
      
      return this.createPaginatedResponse(opportunities, { ...pagination, total }) as OpportunitiesResponse;
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

  // Son aktiviteler
  async getRecentActivities(): Promise<BaseResponse<any>> {
    try {
      const activities = await this.opportunityRepository.getRecentActivities();
      return this.createSuccessResponse(activities);
    } catch (error) {
      console.error('Recent activities error:', error);
      return this.createErrorResponse('Son aktiviteler alınamadı');
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

  // Bekleyen ödemeleri getir
  async getPendingPayments(
    filters: OpportunityFilterDto, 
    pagination: PaginationParams
  ): Promise<OpportunitiesResponse> {
    try {
      const { data, total } = await this.opportunityRepository.findPendingPayments(filters, pagination);
      const opportunities = data.map(this.mapToDto.bind(this));
      
      return this.createPaginatedResponse(opportunities, { ...pagination, total }) as OpportunitiesResponse;
    } catch (error) {
      console.error('Pending payments error:', error);
      return this.createErrorResponse('Bekleyen ödemeler getirilemedi') as OpportunitiesResponse;
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
      const populatedResult = await this.opportunityRepository.findById(result._id as string, 'musteri');
      
      return this.createSuccessResponse(this.mapToDto(populatedResult!), 'Fırsat başarıyla oluşturuldu');
    } catch (error) {
      console.error('Create opportunity error:', error);
      return this.createErrorResponse('Fırsat oluşturulamadı');
    }
  }

  // Validation metodları - esnek yaklaşım
  protected async validateCreate(createDto: CreateOpportunityDto): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Güvenlik kontrolü - sadece kritik olanlar
    if (createDto.detaylar) {
      try {
        const jsonSize = Buffer.byteLength(JSON.stringify(createDto.detaylar), 'utf8');
        if (jsonSize > 50 * 1024) {
          errors.push({ field: 'detaylar', message: 'Detaylar alanı çok büyük (max 50KB)' });
        }
      } catch (error) {
        errors.push({ field: 'detaylar', message: 'Detaylar alanında hata' });
      }
    }

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

    // İşlem türüne özel validasyonlar - esnek yaklaşım (alanlar opsiyonel)
    if (createDto.islem_turu === IslemTuruDto.CALISMA_IZNI) {
      // Sadece format kontrolü yap, zorunlu alan yok - sonradan tamamlanabilir
      if (createDto.detaylar) {
        if (createDto.detaylar.maas && createDto.detaylar.maas <= 0) {
          errors.push({ field: 'detaylar.maas', message: 'Maaş pozitif bir değer olmalıdır' });
        }
        if (createDto.detaylar.calisma_saati && (createDto.detaylar.calisma_saati <= 0 || createDto.detaylar.calisma_saati > 168)) {
          errors.push({ field: 'detaylar.calisma_saati', message: 'Çalışma saati 1-168 arasında olmalıdır' });
        }
      }
      // İşveren, pozisyon, sözleşme türü vs. opsiyonel - update ile eklenebilir
    }

    if (createDto.islem_turu === IslemTuruDto.IKAMET_IZNI) {
      // Tüm alanlar opsiyonel - sadece varsa format kontrolü yap
      if (createDto.detaylar && createDto.detaylar.kayit_tarihi) {
        const sanitizedDate = DataSanitizer.sanitizeDate(createDto.detaylar.kayit_tarihi);
        if (!sanitizedDate) {
          errors.push({ field: 'detaylar.kayit_tarihi', message: 'Geçersiz kayıt tarihi formatı' });
        }
      }
      // Randevu tarihi, ikamet türü, yapılan işlem vs. tamamen opsiyonel
    }

    if (createDto.islem_turu === IslemTuruDto.DIGER) {
      // Temel validasyon - sadece işlem adı zorunlu
      if (!createDto.detaylar || !createDto.detaylar.islem_adi) {
        errors.push({ field: 'detaylar.islem_adi', message: 'İşlem adı zorunludur' });
      }
      // Diğer alanlar opsiyonel - sonradan update ile tamamlanabilir
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
    // Müşteri bilgilerini düzgün map et
    let musteriDto = null;
    if (entity.musteri) {
      if (typeof entity.musteri === 'object' && entity.musteri._id) {
        // Populated customer object
        musteriDto = {
          _id: entity.musteri._id?.toString(),
          ad: entity.musteri.ad,
          soyad: entity.musteri.soyad,
          kimlik_no: entity.musteri.yabanci_kimlik_no,
          telefon: entity.musteri.telefon_no,
          email: entity.musteri.eposta,
          uyrugu: entity.musteri.uyrugu,
          cinsiyet: entity.musteri.cinsiyeti,
          adres: entity.musteri.adres, // Eğer varsa
          photo: entity.musteri.photo
        };
      } else {
        // Sadece ID
        musteriDto = { _id: entity.musteri.toString() };
      }
    }

    return {
      _id: entity._id?.toString(),
      musteri: musteriDto,
      islem_turu: entity.islem_turu as IslemTuruDto,
      durum: entity.durum as any,
      olusturma_tarihi: entity.olusturma_tarihi,
      guncelleme_tarihi: entity.guncelleme_tarihi,
      aciklamalar: entity.aciklamalar,
      ucretler: entity.ucretler,
      pdf_dosyalari: entity.pdf_dosyalari || [],
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
      pdf_dosyalari: createDto.pdf_dosyalari || [],
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
    if (updateDto.pdf_dosyalari !== undefined) entity.pdf_dosyalari = updateDto.pdf_dosyalari;

    return entity;
  }
}