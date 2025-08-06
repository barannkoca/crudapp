// Validation utilities
export class ValidationUtils {
  
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone number validation (Turkish format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+90|0)?(5\d{9})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Turkish ID number validation
  static isValidTcKimlik(tcKimlik: string): boolean {
    if (!tcKimlik || tcKimlik.length !== 11) return false;
    
    const digits = tcKimlik.split('').map(d => parseInt(d));
    
    // İlk rakam 0 olamaz
    if (digits[0] === 0) return false;
    
    // Son rakam kontrol algoritması
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    const checkDigit1 = (oddSum * 7 - evenSum) % 10;
    const checkDigit2 = (oddSum + evenSum + digits[9]) % 10;
    
    return digits[9] === checkDigit1 && digits[10] === checkDigit2;
  }

  // Date validation
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  // Required field validation
  static isRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
    if (value === null || value === undefined || value === '') {
      return {
        isValid: false,
        error: `${fieldName} alanı zorunludur`
      };
    }
    return { isValid: true };
  }

  // String length validation
  static isValidLength(
    value: string, 
    min: number, 
    max: number, 
    fieldName: string
  ): { isValid: boolean; error?: string } {
    if (!value) {
      return { isValid: true }; // Empty değerler başka yerde kontrol edilsin
    }
    
    if (value.length < min) {
      return {
        isValid: false,
        error: `${fieldName} en az ${min} karakter olmalıdır`
      };
    }
    
    if (value.length > max) {
      return {
        isValid: false,
        error: `${fieldName} en fazla ${max} karakter olmalıdır`
      };
    }
    
    return { isValid: true };
  }

  // Number range validation
  static isValidRange(
    value: number, 
    min: number, 
    max: number, 
    fieldName: string
  ): { isValid: boolean; error?: string } {
    if (value < min) {
      return {
        isValid: false,
        error: `${fieldName} en az ${min} olmalıdır`
      };
    }
    
    if (value > max) {
      return {
        isValid: false,
        error: `${fieldName} en fazla ${max} olmalıdır`
      };
    }
    
    return { isValid: true };
  }

  // Enum validation
  static isValidEnum(
    value: any, 
    enumValues: any[], 
    fieldName: string
  ): { isValid: boolean; error?: string } {
    if (!enumValues.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName} geçerli bir değer olmalıdır. Geçerli değerler: ${enumValues.join(', ')}`
      };
    }
    return { isValid: true };
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // File type validation
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // File size validation (in MB)
  static isValidFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // ObjectId validation (MongoDB)
  static isValidObjectId(id: string): boolean {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  // Sanitize string (XSS protection)
  static sanitizeString(str: string): string {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate password strength
  static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Şifre en az bir özel karakter içermelidir (!@#$%^&*)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Composite validation
  static validateFields(validations: Array<{ isValid: boolean; error?: string }>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    validations.forEach(validation => {
      if (!validation.isValid && validation.error) {
        errors.push(validation.error);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}