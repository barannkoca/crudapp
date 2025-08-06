import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BaseResponse, PaginationParams } from '../dto/base.dto';

// Base Controller sınıfı - tüm controller'lar için ortak işlevler
export abstract class BaseController {
  
  // Auth kontrolü
  protected async checkAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; session?: any; response?: NextResponse }> {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return {
          isAuthenticated: false,
          response: NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
        };
      }

      return { isAuthenticated: true, session };
    } catch (error) {
      console.error('Auth check error:', error);
      return {
        isAuthenticated: false,
        response: NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 500 })
      };
    }
  }

  // Query parametrelerini parse et
  protected parseQueryParams(request: NextRequest): { [key: string]: string | null } {
    const { searchParams } = new URL(request.url);
    const params: { [key: string]: string | null } = {};
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  // Pagination parametrelerini parse et
  protected parsePaginationParams(request: NextRequest): PaginationParams {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)) // Max 100, min 1
    };
  }

  // Request body'yi parse et (JSON veya FormData)
  protected async parseRequestBody(request: NextRequest): Promise<{ body?: any; formData?: FormData; contentType: string }> {
    const contentType = request.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        return { formData, contentType };
      } else if (contentType.includes('application/json')) {
        const body = await request.json();
        return { body, contentType };
      } else {
        // Text olarak al
        const text = await request.text();
        return { body: text, contentType };
      }
    } catch (error) {
      console.error('Parse request body error:', error);
      throw new Error('Request body parse edilemedi');
    }
  }

  // Success response oluştur
  protected createSuccessResponse<T>(data: T, message?: string, status: number = 200): NextResponse {
    const response: BaseResponse<T> = {
      success: true,
      data,
      message
    };
    return NextResponse.json(response, { status });
  }

  // Error response oluştur
  protected createErrorResponse(error: string, status: number = 500): NextResponse {
    const response: BaseResponse = {
      success: false,
      error
    };
    return NextResponse.json(response, { status });
  }

  // Validation error response oluştur
  protected createValidationErrorResponse(errors: any[], status: number = 400): NextResponse {
    const errorMessage = errors.map(e => e.message).join(', ');
    return this.createErrorResponse(errorMessage, status);
  }

  // File upload helper
  protected async processFileUpload(file: File): Promise<{ data: string; contentType: string }> {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      
      return {
        data: base64Data,
        contentType: file.type
      };
    } catch (error) {
      console.error('File upload processing error:', error);
      throw new Error('Dosya yüklenirken hata oluştu');
    }
  }

  // Database bağlantı kontrolü
  protected async ensureDbConnection(): Promise<void> {
    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error('Veritabanı bağlantısı sağlanamadı');
    }
  }

  // Try-catch wrapper
  protected async handleRequest<T>(
    requestHandler: () => Promise<T>,
    errorMessage: string = 'İşlem gerçekleştirilemedi'
  ): Promise<T | NextResponse> {
    try {
      await this.ensureDbConnection();
      return await requestHandler();
    } catch (error) {
      console.error(`Request handling error: ${errorMessage}`, error);
      
      if (error instanceof Error) {
        return this.createErrorResponse(error.message);
      }
      
      return this.createErrorResponse(errorMessage);
    }
  }

  // Filter parametrelerini temizle
  protected cleanFilterParams(params: any): any {
    const cleanParams: any = {};
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
    
    return cleanParams;
  }

  // Date range parametrelerini parse et
  protected parseDateRange(params: any): { date_from?: Date; date_to?: Date } {
    const dateRange: { date_from?: Date; date_to?: Date } = {};
    
    if (params.date_from) {
      const date = new Date(params.date_from);
      if (!isNaN(date.getTime())) {
        dateRange.date_from = date;
      }
    }
    
    if (params.date_to) {
      const date = new Date(params.date_to);
      if (!isNaN(date.getTime())) {
        // Günün sonunu al
        date.setHours(23, 59, 59, 999);
        dateRange.date_to = date;
      }
    }
    
    return dateRange;
  }

  // CORS headers ekle
  protected addCorsHeaders(response: NextResponse): NextResponse {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // OPTIONS request handler
  protected handleOptionsRequest(): NextResponse {
    const response = new NextResponse(null, { status: 200 });
    return this.addCorsHeaders(response);
  }
}