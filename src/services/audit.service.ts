import { AuditLog } from '../../models/AuditLog';
import { NextRequest } from 'next/server';

export interface AuditLogData {
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT';
  resourceType: 'Customer' | 'Opportunity' | 'User';
  resourceId?: string; // Başarısız işlemlerde undefined olabilir
  changes?: {
    before?: any;
    after?: any;
  };
  securityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  success?: boolean;
  errorMessage?: string;
  duration?: number;
}

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
}

export class AuditService {
  
  // Audit log kaydet
  static async log(
    logData: AuditLogData, 
    request?: NextRequest,
    metadata?: RequestMetadata
  ): Promise<void> {
    try {
      const auditEntry = new AuditLog({
        ...logData,
        metadata: metadata || this.extractMetadata(request),
        timestamp: new Date()
      });
      
      await auditEntry.save();
    } catch (error) {
      // Audit log hatası sistem çalışmasını etkilememeli
      console.error('Audit log kaydetme hatası:', error);
    }
  }

  // Request'ten metadata çıkar
  private static extractMetadata(request?: NextRequest): RequestMetadata {
    if (!request) return {};
    
    return {
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: request.nextUrl.pathname,
      method: request.method
    };
  }

  // Başarılı işlem kaydı
  static async logSuccess(
    userId: string,
    userEmail: string,
    action: AuditLogData['action'],
    resourceType: AuditLogData['resourceType'],
    resourceId?: string,
    request?: NextRequest,
    changes?: AuditLogData['changes'],
    duration?: number
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      action,
      resourceType,
      resourceId,
      changes,
      success: true,
      duration,
      securityLevel: this.getSecurityLevel(action, resourceType)
    }, request);
  }

  // Başarısız işlem kaydı
  static async logFailure(
    userId: string,
    userEmail: string,
    action: AuditLogData['action'],
    resourceType: AuditLogData['resourceType'],
    errorMessage: string,
    resourceId?: string,
    request?: NextRequest,
    securityLevel: AuditLogData['securityLevel'] = 'HIGH'
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      action,
      resourceType,
      resourceId,
      success: false,
      errorMessage,
      securityLevel
    }, request);
  }

  // Güvenlik seviyesi belirle
  private static getSecurityLevel(
    action: AuditLogData['action'], 
    resourceType: AuditLogData['resourceType']
  ): AuditLogData['securityLevel'] {
    // Kritik işlemler
    if (action === 'DELETE' || resourceType === 'User') {
      return 'CRITICAL';
    }
    
    // Yüksek güvenlik
    if (action === 'UPDATE') {
      return 'HIGH';
    }
    
    // Orta güvenlik
    if (action === 'CREATE') {
      return 'MEDIUM';
    }
    
    // Düşük güvenlik
    return 'LOW';
  }

  // Güvenlik olaylarını kaydet
  static async logSecurityEvent(
    description: string,
    request?: NextRequest,
    userId?: string,
    securityLevel: AuditLogData['securityLevel'] = 'CRITICAL'
  ): Promise<void> {
    await this.log({
      userId: userId || 'system',
      userEmail: 'system@security',
      action: 'VIEW', // Güvenlik olayları için VIEW kullanıyoruz
      resourceType: 'User',
      resourceId: undefined, // Güvenlik olayları için resourceId gerekli değil
      success: false,
      errorMessage: description,
      securityLevel
    }, request);
  }

  // Kullanıcı aktivitelerini getir
  static async getUserActivities(
    userId: string, 
    limit: number = 50
  ): Promise<any[]> {
    try {
      return await (AuditLog as any).find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'name email')
        .lean();
    } catch (error) {
      console.error('Kullanıcı aktiviteleri getirme hatası:', error);
      return [];
    }
  }

  // Kaynak geçmişini getir
  static async getResourceHistory(
    resourceType: AuditLogData['resourceType'],
    resourceId?: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      return await (AuditLog as any).find({ resourceType, resourceId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'name email')
        .lean();
    } catch (error) {
      console.error('Kaynak geçmişi getirme hatası:', error);
      return [];
    }
  }

  // Güvenlik raporları
  static async getSecurityReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    failedAttempts: number;
    criticalEvents: number;
    topUsers: any[];
    topIPs: any[];
  }> {
    try {
      const pipeline = [
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $facet: {
            totalEvents: [{ $count: "count" }],
            failedAttempts: [
              { $match: { success: false } },
              { $count: "count" }
            ],
            criticalEvents: [
              { $match: { securityLevel: 'CRITICAL' } },
              { $count: "count" }
            ],
            topUsers: [
              { $group: { _id: "$userId", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            topIPs: [
              { $group: { _id: "$metadata.ipAddress", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ]
          }
        }
      ];

      const [result] = await AuditLog.aggregate(pipeline as any);
      
      return {
        totalEvents: result.totalEvents[0]?.count || 0,
        failedAttempts: result.failedAttempts[0]?.count || 0,
        criticalEvents: result.criticalEvents[0]?.count || 0,
        topUsers: result.topUsers || [],
        topIPs: result.topIPs || []
      };
    } catch (error) {
      console.error('Güvenlik raporu oluşturma hatası:', error);
      return {
        totalEvents: 0,
        failedAttempts: 0,
        criticalEvents: 0,
        topUsers: [],
        topIPs: []
      };
    }
  }

  // Anomali tespiti
  static async detectAnomalies(
    userId: string,
    timeWindowMinutes: number = 60
  ): Promise<{
    hasAnomaly: boolean;
    reasons: string[];
  }> {
    try {
      const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
      
      const recentLogs = await (AuditLog as any).find({
        userId,
        timestamp: { $gte: since }
      }).lean();

      const reasons: string[] = [];
      
      // Çok fazla başarısız deneme
      const failedAttempts = recentLogs.filter(log => !log.success).length;
      if (failedAttempts > 5) {
        reasons.push(`Son ${timeWindowMinutes} dakikada ${failedAttempts} başarısız deneme`);
      }
      
      // Çok fazla işlem
      if (recentLogs.length > 100) {
        reasons.push(`Son ${timeWindowMinutes} dakikada ${recentLogs.length} işlem`);
      }
      
      // Farklı IP'lerden erişim
      const uniqueIPs = new Set(recentLogs.map(log => log.metadata?.ipAddress)).size;
      if (uniqueIPs > 3) {
        reasons.push(`${uniqueIPs} farklı IP adresinden erişim`);
      }
      
      return {
        hasAnomaly: reasons.length > 0,
        reasons
      };
    } catch (error) {
      console.error('Anomali tespiti hatası:', error);
      return { hasAnomaly: false, reasons: [] };
    }
  }
}