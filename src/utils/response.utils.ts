import { NextResponse } from 'next/server';
import { BaseResponse, PaginatedResponse } from '../dto/base.dto';

// Response utilities
export class ResponseUtils {
  
  // Success response
  static success<T>(
    data: T,
    message?: string,
    status: number = 200
  ): NextResponse {
    const response: BaseResponse<T> = {
      success: true,
      data,
      message
    };
    return NextResponse.json(response, { status });
  }

  // Error response
  static error(
    error: string,
    status: number = 500,
    details?: any
  ): NextResponse {
    const response: BaseResponse = {
      success: false,
      error,
      ...(details && { details })
    };
    return NextResponse.json(response, { status });
  }

  // Paginated response
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    },
    message?: string,
    status: number = 200
  ): NextResponse {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination,
      message
    };
    return NextResponse.json(response, { status });
  }

  // Created response
  static created<T>(data: T, message?: string): NextResponse {
    return ResponseUtils.success(data, message || 'Kayıt başarıyla oluşturuldu', 201);
  }

  // Updated response
  static updated<T>(data: T, message?: string): NextResponse {
    return ResponseUtils.success(data, message || 'Kayıt başarıyla güncellendi', 200);
  }

  // Deleted response
  static deleted(message?: string): NextResponse {
    return ResponseUtils.success(true, message || 'Kayıt başarıyla silindi', 200);
  }

  // Not found response
  static notFound(message?: string): NextResponse {
    return ResponseUtils.error(message || 'Kayıt bulunamadı', 404);
  }

  // Bad request response
  static badRequest(message?: string, details?: any): NextResponse {
    return ResponseUtils.error(message || 'Geçersiz istek', 400, details);
  }

  // Unauthorized response
  static unauthorized(message?: string): NextResponse {
    return ResponseUtils.error(message || 'Yetkilendirme gerekli', 401);
  }

  // Forbidden response
  static forbidden(message?: string): NextResponse {
    return ResponseUtils.error(message || 'Bu işlem için yetkiniz yok', 403);
  }

  // Conflict response
  static conflict(message?: string): NextResponse {
    return ResponseUtils.error(message || 'Veri çakışması', 409);
  }

  // Validation error response
  static validationError(errors: any[]): NextResponse {
    const errorMessage = errors.map(e => e.message || e).join(', ');
    return ResponseUtils.badRequest(errorMessage, errors);
  }

  // Internal server error response
  static internalError(message?: string): NextResponse {
    return ResponseUtils.error(
      message || 'Sunucu hatası',
      500
    );
  }

  // Add CORS headers
  static addCorsHeaders(response: NextResponse): NextResponse {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // Handle OPTIONS request
  static options(): NextResponse {
    const response = new NextResponse(null, { status: 200 });
    return ResponseUtils.addCorsHeaders(response);
  }
}