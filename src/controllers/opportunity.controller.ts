import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './base.controller';
import { OpportunityService } from '../services/opportunity.service';
import { CreateOpportunityDto, UpdateOpportunityDto, OpportunityFilterDto, IslemTuruDto } from '../dto/opportunity.dto';
import { AuditService } from '../services/audit.service';

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
      
      // Pagination bilgilerini response'a ekle
      return NextResponse.json({
        success: true,
        data: result.data || [],
        total: result.pagination?.total || (result.data?.length || 0),
        totalPages: result.pagination?.totalPages || Math.ceil((result.pagination?.total || (result.data?.length || 0)) / pagination.limit),
        message: result.message
      });
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
      
      // Pagination bilgilerini response'a ekle
      return NextResponse.json({
        success: true,
        data: result.data || [],
        total: result.pagination?.total || (result.data?.length || 0),
        totalPages: result.pagination?.totalPages || Math.ceil((result.pagination?.total || (result.data?.length || 0)) / pagination.limit),
        message: result.message
      });
    }, 'Müşteri fırsatları getirilemedi');
  }



  // POST /api/opportunities - Yeni fırsat
  async createOpportunity(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      console.log('🎯 OpportunityController.createOpportunity called');
      
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        console.log('❌ Authentication failed');
        return authResult.response!;
      }

      const { body, formData, contentType } = await this.parseRequestBody(request);
      console.log('📝 Request Content-Type:', contentType);
      console.log('📋 Request Body:', body);
      
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

        // PDF dosyaları varsa işle (birden fazla)
        const pdfFiles = formData.getAll('pdf_dosyalari') as File[];
        if (pdfFiles && pdfFiles.length > 0) {
          createDto.pdf_dosyalari = [];
          for (const pdfFile of pdfFiles) {
            if (pdfFile && pdfFile.size > 0) {
              const processedFile = await this.processFileUpload(pdfFile);
              createDto.pdf_dosyalari.push({
                ...processedFile,
                dosya_adi: pdfFile.name,
                dosya_boyutu: pdfFile.size,
                yuklenme_tarihi: new Date()
              });
            }
          }
        }
      } else {
        createDto = body;
        // JSON ile gelen PDF dosyalarını işle
        if (createDto.pdf_dosyalari && Array.isArray(createDto.pdf_dosyalari)) {
          // JSON ile gelen veriler zaten işlenmiş durumda, timestamp ekle
          createDto.pdf_dosyalari = createDto.pdf_dosyalari.map((pdf: any) => ({
            ...pdf,
            yuklenme_tarihi: pdf.yuklenme_tarihi || new Date()
          }));
        }
      }

      console.log('💾 Final CreateDTO:', createDto);
      
      const startTime = Date.now();
      const result = await this.opportunityService.createOpportunity(createDto);
      
      console.log('🔄 Service Result:', result);
      
      if (!result.success) {
        // Başarısız fırsat oluşturma audit log
        await AuditService.logFailure(
          authResult.session.user.id,
          authResult.session.user.email,
          'CREATE',
          'Opportunity',
          'unknown',
          result.error!,
          request
        );
        return this.createErrorResponse(result.error!, 400);
      }
      
      // Başarılı fırsat oluşturma audit log
      await AuditService.logSuccess(
        authResult.session.user.id,
        authResult.session.user.email,
        'CREATE',
        'Opportunity',
        result.data?._id || 'unknown',
        request,
        {
          before: null,
          after: result.data
        },
        Date.now() - startTime
      );
      
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

        // PDF dosyaları varsa işle (birden fazla)
        const pdfFiles = formData.getAll('pdf_dosyalari') as File[];
        if (pdfFiles && pdfFiles.length > 0) {
          updateDto.pdf_dosyalari = [];
          for (const pdfFile of pdfFiles) {
            if (pdfFile && pdfFile.size > 0) {
              const processedFile = await this.processFileUpload(pdfFile);
              updateDto.pdf_dosyalari.push({
                ...processedFile,
                dosya_adi: pdfFile.name,
                dosya_boyutu: pdfFile.size,
                yuklenme_tarihi: new Date()
              });
            }
          }
        }
      } else {
        updateDto = body;
        // JSON ile gelen PDF dosyalarını işle
        if (updateDto.pdf_dosyalari && Array.isArray(updateDto.pdf_dosyalari)) {
          // JSON ile gelen veriler zaten işlenmiş durumda, timestamp ekle
          updateDto.pdf_dosyalari = updateDto.pdf_dosyalari.map((pdf: any) => ({
            ...pdf,
            yuklenme_tarihi: pdf.yuklenme_tarihi || new Date()
          }));
        }
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

  // GET /api/opportunities/recent - Son aktiviteler
  async getRecentActivities(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.opportunityService.getRecentActivities();
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Son aktiviteler alınamadı');
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

  // POST /api/opportunities/[id]/upload-pdfs - PDF yükle
  async uploadPdfs(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const formData = await request.formData();
      const files: File[] = [];

      // FormData'dan dosyaları al
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('pdf_') && value instanceof File) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return this.createErrorResponse('Yüklenecek PDF dosyası bulunamadı', 400);
      }

      // Dosyaları base64'e çevir
      const pdfDosyalari: any[] = [];
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        
        pdfDosyalari.push({
          data: base64,
          contentType: file.type,
          dosya_adi: file.name,
          dosya_boyutu: file.size,
          yuklenme_tarihi: new Date()
        });
      }

      // Mevcut opportunity'yi al
      const opportunity = await this.opportunityService.getById(params.id);
      if (!opportunity.success || !opportunity.data) {
        return this.createErrorResponse('Fırsat bulunamadı', 404);
      }

      // Mevcut PDF'leri koru ve yenilerini ekle
      const mevcutPdfler = opportunity.data.pdf_dosyalari || [];
      const guncelPdfler = [...mevcutPdfler, ...pdfDosyalari];

      // Opportunity'yi güncelle
      const updateResult = await this.opportunityService.update(params.id, {
        pdf_dosyalari: guncelPdfler
      });

      if (!updateResult.success) {
        return this.createErrorResponse(updateResult.error!, 500);
      }

      return this.createSuccessResponse(updateResult.data, `${files.length} PDF dosyası başarıyla yüklendi`);
    }, 'PDF dosyaları yüklenemedi');
  }

  // DELETE /api/opportunities/[id]/delete-pdf/[index] - PDF sil
  async deletePdf(request: NextRequest, params: { id: string, index: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const pdfIndex = parseInt(params.index);
      if (isNaN(pdfIndex) || pdfIndex < 0) {
        return this.createErrorResponse('Geçersiz PDF indeksi', 400);
      }

      // Mevcut opportunity'yi al
      const opportunity = await this.opportunityService.getById(params.id);
      if (!opportunity.success || !opportunity.data) {
        return this.createErrorResponse('Fırsat bulunamadı', 404);
      }

      const mevcutPdfler = opportunity.data.pdf_dosyalari || [];
      
      if (pdfIndex >= mevcutPdfler.length) {
        return this.createErrorResponse('PDF bulunamadı', 404);
      }

      // PDF'i sil
      const guncelPdfler = mevcutPdfler.filter((_: any, index: number) => index !== pdfIndex);

      // Opportunity'yi güncelle
      const updateResult = await this.opportunityService.update(params.id, {
        pdf_dosyalari: guncelPdfler
      });

      if (!updateResult.success) {
        return this.createErrorResponse(updateResult.error!, 500);
      }

      return this.createSuccessResponse(updateResult.data, 'PDF dosyası başarıyla silindi');
    }, 'PDF dosyası silinemedi');
  }

  // Artık tarih bazlı sıralama ve genel arama (search) kullanılıyor
}