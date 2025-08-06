// Base DTO sınıfları ve interface'leri

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip?: number;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiRequest {
  query: Record<string, any>;
  body: Record<string, any>;
  params: Record<string, any>;
  session?: any;
}

export interface FilterParams {
  [key: string]: any;
}

// Genel validation error interface'i
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}