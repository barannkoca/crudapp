import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '../utils/data-integrity.utils';

/**
 * Güvenlik Middleware'leri
 */

export class SecurityMiddleware {
  
  // Rate limiting kontrolü
  static checkRateLimit(identifier: string, maxRequests: number = 100): boolean {
    return RateLimiter.checkRateLimit(identifier, maxRequests);
  }

  // Request size kontrolü
  static checkRequestSize(request: NextRequest, maxSizeKB: number = 100): boolean {
    const contentLength = request.headers.get('content-length');
    if (!contentLength) return true;
    
    const sizeKB = parseInt(contentLength) / 1024;
    return sizeKB <= maxSizeKB;
  }

  // Content-Type kontrolü
  static validateContentType(request: NextRequest): boolean {
    const contentType = request.headers.get('content-type') || '';
    const allowedTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded'
    ];
    
    return allowedTypes.some(type => contentType.includes(type));
  }

  // SQL/NoSQL injection protection
  static containsMaliciousPatterns(data: any): boolean {
    const maliciousPatterns = [
      /\$where/i,
      /\$regex/i,
      /\$gt/i,
      /\$lt/i,
      /\$ne/i,
      /javascript:/i,
      /<script/i,
      /eval\s*\(/i,
      /function\s*\(/i,
      /setTimeout/i,
      /setInterval/i,
      /require\s*\(/i,
      /process\./i,
      /global\./i,
      /__proto__/i,
      /constructor/i,
      /prototype/i
    ];

    const jsonString = JSON.stringify(data);
    return maliciousPatterns.some(pattern => pattern.test(jsonString));
  }

  // XSS koruması
  static sanitizeForXSS(input: string): string {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // CSRF token validation (basit implementasyon)
  static validateCSRFToken(request: NextRequest): boolean {
    // Header veya cookie'den CSRF token kontrolü
    const headerToken = request.headers.get('x-csrf-token');
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    
    // Same-origin kontrolü
    if (origin) {
      const requestOrigin = new URL(origin);
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://yourdomain.com'
      ];
      
      return allowedOrigins.includes(requestOrigin.origin);
    }
    
    return true; // Development için gevşek kontrol
  }

  // File upload güvenlik kontrolü
  static validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('Dosya boyutu 5MB\'dan büyük olamaz');
    }
    
    // Dosya tipi kontrolü
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Sadece PDF ve resim dosyaları yüklenebilir');
    }
    
    // Dosya adı kontrolü
    const fileName = file.name;
    const dangerousChars = /[<>:"/\\|?*]/;
    if (dangerousChars.test(fileName)) {
      errors.push('Dosya adında geçersiz karakterler var');
    }
    
    // Dosya uzantısı kontrolü
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push('Geçersiz dosya uzantısı');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // IP-based blocking (basit implementasyon)
  static isBlockedIP(request: NextRequest): boolean {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    
    // Kara liste IP'leri
    const blockedIPs: string[] = [
      // '192.168.1.100', // Örnek blocked IP
    ];
    
    return blockedIPs.includes(clientIP.split(',')[0].trim());
  }

  // Honeypot field kontrolü (bot koruması)
  static checkHoneypot(requestBody: any): boolean {
    // Form'da gizli honeypot field'ı varsa ve doldurulmuşsa bot'tur
    return !requestBody.honeypot || requestBody.honeypot === '';
  }

  // Comprehensive security check
  static async performSecurityChecks(request: NextRequest, body?: any): Promise<{
    isSecure: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    // IP kontrolü
    if (this.isBlockedIP(request)) {
      errors.push('IP adresi engellendi');
    }
    
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!this.checkRateLimit(clientIP)) {
      errors.push('Çok fazla istek gönderildi');
    }
    
    // Request size kontrolü
    if (!this.checkRequestSize(request)) {
      errors.push('İstek boyutu çok büyük');
    }
    
    // Content-Type kontrolü
    if (request.method === 'POST' && !this.validateContentType(request)) {
      errors.push('Geçersiz content-type');
    }
    
    // Body kontrolü
    if (body) {
      // Malicious pattern kontrolü
      if (this.containsMaliciousPatterns(body)) {
        errors.push('Güvenlik tehdidi tespit edildi');
      }
      
      // Honeypot kontrolü
      if (!this.checkHoneypot(body)) {
        errors.push('Bot aktivitesi tespit edildi');
      }
    }
    
    // CSRF kontrolü
    if (request.method === 'POST' && !this.validateCSRFToken(request)) {
      errors.push('CSRF token doğrulaması başarısız');
    }
    
    return {
      isSecure: errors.length === 0,
      errors
    };
  }
}

// Rate limiter temizleme (memory leak prevention)
setInterval(() => {
  RateLimiter.clearOldRecords();
}, 5 * 60 * 1000); // Her 5 dakikada bir temizle