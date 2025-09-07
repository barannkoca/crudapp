import mongoose from 'mongoose';

// Audit Log Şeması
const auditLogSchema = new mongoose.Schema({
  // Kim yaptı
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Ne yapıldı
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'],
    required: true
  },
  
  // Hangi kaynak etkilendi
  resourceType: {
    type: String,
    enum: ['Customer', 'Opportunity', 'User'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Başarısız işlemlerde null olabilir (örn: CREATE işlemi başarısız olduğunda)
  },
  
  // Değişiklik detayları
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed }
  },
  
  // Meta bilgiler
  metadata: {
    ipAddress: String,
    userAgent: String,
    requestId: String,
    sessionId: String,
    endpoint: String,
    method: String
  },
  
  // Güvenlik bilgileri
  securityLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  
  // Başarı durumu
  success: {
    type: Boolean,
    default: true
  },
  
  errorMessage: String,
  
  // Zaman bilgileri
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  duration: Number // İşlem süresi (ms)
  
}, {
  strict: true,
  collection: 'audit_logs'
});

// Indeksler
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ securityLevel: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // TTL için
auditLogSchema.index({ 'metadata.ipAddress': 1 });

// TTL - 1 yıl sonra otomatik sil
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);