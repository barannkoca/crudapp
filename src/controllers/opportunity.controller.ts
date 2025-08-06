import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './base.controller';
import { OpportunityService } from '../services/opportunity.service';
import { CreateOpportunityDto, UpdateOpportunityDto, OpportunityFilterDto, IslemTuruDto } from '../dto/opportunity.dto';

export class OpportunityController extends BaseController {
  private opportunityService: OpportunityService;

  constructor() {
    super();
    this.opportunityService = new OpportunityService();
  }

  // GET /api/opportunities - Fırsat listesi
  async getOpportunities(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const pagination = this.parsePaginationParams(request);
      const queryParams = this.parseQueryParams(request);
      const dateRange = this.parseDateRange(queryParams);
      
      // Filtreleme parametrelerini hazırla
      const filters: OpportunityFilterDto = this.cleanFilterParams({
        islem_turu: queryParams.islem_turu as IslemTuruDto,
        durum: queryParams.durum,
        musteri_id: queryParams.musteri_id,
        search: queryParams.search,
        sort_by: queryParams.sort_by as 'olusturma_tarihi' | 'guncelleme_tarihi',
        sort_order: queryParams.sort_order as 'asc' | 'desc',
        ...dateRange
      });

      const result = await this.opportunityService.getOpportunitiesByFilters(filters, pagination);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Fırsatlar getirilemedi');
  }

  // GET /api/opportunities/[id] - Tekil fırsat
  async getOpportunityById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.opportunityService.getById(params.id);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 404);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Fırsat getirilemedi');
  }

  // GET /api/opportunities/customer/[customerId] - Müşteriye ait fırsatlar
  async getOpportunitiesByCustomer(request: NextRequest, params: { customerId: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const pagination = this.parsePaginationParams(request);
      const result = await this.opportunityService.getOpportunitiesByCustomer(params.customerId, pagination);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteri fırsatları getirilemedi');
  }



  // POST /api/opportunities - Yeni fırsat
  async createOpportunity(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const { body, formData, contentType } = await this.parseRequestBody(request);
      
      let createDto: CreateOpportunityDto;

      if (contentType.includes('multipart/form-data') && formData) {
        // FormData'dan fırsat bilgilerini al
        createDto = {
          musteri_id: formData.get('musteri_id') as string,
          islem_turu: formData.get('islem_turu') as IslemTuruDto,
          detaylar: formData.get('detaylar') ? JSON.parse(formData.get('detaylar') as string) : undefined,
          aciklamalar: formData.get('aciklamalar') ? JSON.parse(formData.get('aciklamalar') as string) : undefined,
          ucretler: formData.get('ucretler') ? JSON.parse(formData.get('ucretler') as string) : undefined
        };

        // PDF dosyası varsa işle
        const pdfFile = formData.get('pdf_dosya') as File;
        if (pdfFile && pdfFile.size > 0) {
          createDto.pdf_dosya = await this.processFileUpload(pdfFile);
        }
      } else {
        createDto = body;
      }

      const result = await this.opportunityService.createOpportunity(createDto);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 400);
      }
      
      return this.createSuccessResponse(result.data, result.message, 201);
    }, 'Fırsat oluşturulamadı');
  }

  // PUT /api/opportunities/[id] - Fırsat güncelle
  async updateOpportunity(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const { body, formData, contentType } = await this.parseRequestBody(request);
      
      let updateDto: UpdateOpportunityDto;

      if (contentType.includes('multipart/form-data') && formData) {
        // FormData'dan fırsat bilgilerini al
        updateDto = {};
        
        if (formData.get('durum')) updateDto.durum = formData.get('durum') as any;
        if (formData.get('detaylar')) updateDto.detaylar = JSON.parse(formData.get('detaylar') as string);
        if (formData.get('aciklamalar')) updateDto.aciklamalar = JSON.parse(formData.get('aciklamalar') as string);
        if (formData.get('ucretler')) updateDto.ucretler = JSON.parse(formData.get('ucretler') as string);

        // PDF dosyası varsa işle
        const pdfFile = formData.get('pdf_dosya') as File;
        if (pdfFile && pdfFile.size > 0) {
          updateDto.pdf_dosya = await this.processFileUpload(pdfFile);
        }
      } else {
        updateDto = body;
      }

      const result = await this.opportunityService.update(params.id, updateDto);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 400);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Fırsat güncellenemedi');
  }

  // DELETE /api/opportunities/[id] - Fırsat sil
  async deleteOpportunity(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.opportunityService.delete(params.id);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 404);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Fırsat silinemedi');
  }

  // GET /api/opportunities/stats - Fırsat istatistikleri
  async getOpportunityStats(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.opportunityService.getOpportunityStats();
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'İstatistikler alınamadı');
  }

  // GET /api/opportunities/payment-stats - Ödeme istatistikleri
  async getPaymentStats(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.opportunityService.getPaymentStats();
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Ödeme istatistikleri alınamadı');
  }

  // Artık tarih bazlı sıralama ve genel arama (search) kullanılıyor
}