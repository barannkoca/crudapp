import { NextRequest, NextResponse } from 'next/server';

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Kayıt bulunamadı') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Yetkisiz erişim') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Bu işlem için yetkiniz yok') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Veri çakışması') {
    super(message, 409);
  }
}

// Error handler middleware
export class ErrorHandler {
  static handle(error: any): NextResponse {
    console.error('Error occurred:', error);

    // Operational errors (bilinen hatalar)
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        },
        { status: error.statusCode }
      );
    }

    // MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Validasyon hatası',
          details: messages
        },
        { status: 400 }
      );
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        {
          success: false,
          error: `${field} alanı zaten kullanımda`
        },
        { status: 409 }
      );
    }

    // MongoDB cast error
    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz ID formatı'
        },
        { status: 400 }
      );
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz token'
        },
        { status: 401 }
      );
    }

    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Token süresi dolmuş'
        },
        { status: 401 }
      );
    }

    // Programming errors (bilinmeyen hatalar)
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Sunucu hatası' 
          : error.message,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error.stack,
          details: error 
        })
      },
      { status: 500 }
    );
  }

  // Async error wrapper
  static asyncWrapper(fn: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        return await fn(req, ...args);
      } catch (error) {
        return ErrorHandler.handle(error);
      }
    };
  }
}

// Utility functions
export const throwValidationError = (message: string) => {
  throw new ValidationError(message);
};

export const throwNotFoundError = (message?: string) => {
  throw new NotFoundError(message);
};

export const throwUnauthorizedError = (message?: string) => {
  throw new UnauthorizedError(message);
};

export const throwForbiddenError = (message?: string) => {
  throw new ForbiddenError(message);
};

export const throwConflictError = (message?: string) => {
  throw new ConflictError(message);
};