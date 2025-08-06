import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './base.controller';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFilterDto } from '../dto/customer.dto';

export class CustomerController extends BaseController {
  private customerService: CustomerService;

  constructor() {
    super();
    this.customerService = new CustomerService();
  }

  // GET /api/customers - Müşteri listesi
  async getCustomers(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const pagination = this.parsePaginationParams(request);
      const queryParams = this.parseQueryParams(request);
      
      // Arama var mı kontrol et
      if (queryParams.search) {
        const result = await this.customerService.searchCustomers(
          queryParams.search,
          pagination
        );
        
        if (!result.success) {
          return this.createErrorResponse(result.error!);
        }
        
        return this.createSuccessResponse(result.data, result.message);
      }

      // Filtreleme parametrelerini hazırla
      const filters: CustomerFilterDto = this.cleanFilterParams({
        ad: queryParams.ad,
        soyad: queryParams.soyad,
        yabanci_kimlik_no: queryParams.yabanci_kimlik_no,
        uyrugu: queryParams.uyrugu,
        cinsiyeti: queryParams.cinsiyeti as "Erkek" | "Kadın",
        telefon_no: queryParams.telefon_no,
        eposta: queryParams.eposta,
        search: queryParams.search
      });

      const result = await this.customerService.getCustomersByFilters(filters, pagination);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteriler getirilemedi');
  }

  // GET /api/customers/select - Select için müşteri listesi
  async getCustomersForSelect(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.customerService.getCustomersForSelect();
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteri listesi alınamadı');
  }

  // GET /api/customers/[id] - Tekil müşteri
  async getCustomerById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.customerService.getById(params.id);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 404);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteri getirilemedi');
  }

  // POST /api/customers - Yeni müşteri
  async createCustomer(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const { body, formData, contentType } = await this.parseRequestBody(request);
      
      let createDto: CreateCustomerDto;

      if (contentType.includes('multipart/form-data') && formData) {
        // FormData'dan müşteri bilgilerini al
        createDto = {
          ad: formData.get('ad') as string,
          soyad: formData.get('soyad') as string,
          yabanci_kimlik_no: formData.get('yabanci_kimlik_no') as string || undefined,
          uyrugu: formData.get('uyrugu') as string || undefined,
          cinsiyeti: formData.get('cinsiyeti') as "Erkek" | "Kadın",
          telefon_no: formData.get('telefon_no') as string || undefined,
          eposta: formData.get('eposta') as string || undefined
        };

        // Fotoğraf varsa işle
        const photoFile = formData.get('photo') as File;
        if (photoFile && photoFile.size > 0) {
          createDto.photo = await this.processFileUpload(photoFile);
        }
      } else {
        createDto = body;
      }

      const result = await this.customerService.create(createDto);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 400);
      }
      
      return this.createSuccessResponse(result.data, result.message, 201);
    }, 'Müşteri oluşturulamadı');
  }

  // PUT /api/customers/[id] - Müşteri güncelle
  async updateCustomer(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const { body, formData, contentType } = await this.parseRequestBody(request);
      
      let updateDto: UpdateCustomerDto;

      if (contentType.includes('multipart/form-data') && formData) {
        // FormData'dan müşteri bilgilerini al
        updateDto = {};
        
        if (formData.get('ad')) updateDto.ad = formData.get('ad') as string;
        if (formData.get('soyad')) updateDto.soyad = formData.get('soyad') as string;
        if (formData.get('yabanci_kimlik_no')) updateDto.yabanci_kimlik_no = formData.get('yabanci_kimlik_no') as string;
        if (formData.get('uyrugu')) updateDto.uyrugu = formData.get('uyrugu') as string;
        if (formData.get('cinsiyeti')) updateDto.cinsiyeti = formData.get('cinsiyeti') as "Erkek" | "Kadın";
        if (formData.get('telefon_no')) updateDto.telefon_no = formData.get('telefon_no') as string;
        if (formData.get('eposta')) updateDto.eposta = formData.get('eposta') as string;

        // Fotoğraf varsa işle
        const photoFile = formData.get('photo') as File;
        if (photoFile && photoFile.size > 0) {
          updateDto.photo = await this.processFileUpload(photoFile);
        }
      } else {
        updateDto = body;
      }

      const result = await this.customerService.update(params.id, updateDto);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 400);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteri güncellenemedi');
  }

  // DELETE /api/customers/[id] - Müşteri sil
  async deleteCustomer(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.customerService.delete(params.id);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 404);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteri silinemedi');
  }

  // GET /api/customers/stats - Müşteri istatistikleri
  async getCustomerStats(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.customerService.getCustomerStats();
      
      if (!result.success) {
        return this.createErrorResponse(result.error!);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'İstatistikler alınamadı');
  }

  // GET /api/customers/kimlik/[kimlikNo] - Kimlik numarası ile müşteri
  async getCustomerByKimlikNo(request: NextRequest, params: { kimlikNo: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.customerService.getCustomerByKimlikNo(params.kimlikNo);
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 404);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteri getirilemedi');
  }

  // GET /api/customers/email/[email] - Email ile müşteri
  async getCustomerByEmail(request: NextRequest, params: { email: string }): Promise<NextResponse> {
    return this.handleRequest(async () => {
      const authResult = await this.checkAuth(request);
      if (!authResult.isAuthenticated) {
        return authResult.response!;
      }

      const result = await this.customerService.getCustomerByEmail(decodeURIComponent(params.email));
      
      if (!result.success) {
        return this.createErrorResponse(result.error!, 404);
      }
      
      return this.createSuccessResponse(result.data, result.message);
    }, 'Müşteri getirilemedi');
  }
}