# Audit Log Hatası Düzeltmesi

## Problem
Audit log kaydetme sırasında aşağıdaki hata alınıyordu:

```
AuditLog validation failed: resourceId: Cast to ObjectId failed for value "unknown" (type string) at path "resourceId" because of "BSONError"
```

## Hatanın Nedeni
- `AuditLog` şemasında `resourceId` alanı `ObjectId` tipinde ve zorunlu (`required: true`) olarak tanımlanmıştı
- CREATE işlemleri başarısız olduğunda, controller'larda `'unknown'` string değeri `resourceId` olarak geçiliyordu
- MongoDB, string değeri ObjectId'ye dönüştürmeye çalışırken hata veriyordu

## Çözüm
1. **AuditLog Şeması Güncellendi** (`models/AuditLog.ts`):
   - `resourceId` alanı artık zorunlu değil (`required: false`)
   - Başarısız işlemlerde `resourceId` `null` veya `undefined` olabilir

2. **Audit Service Interface Güncellendi** (`src/services/audit.service.ts`):
   - `AuditLogData` interface'inde `resourceId` artık opsiyonel (`resourceId?: string`)
   - `logSuccess` ve `logFailure` method'larının parametreleri güncellendi

3. **Controller'lar Güncellendi**:
   - `customer.controller.ts` ve `opportunity.controller.ts`'de başarısız CREATE işlemlerinde `'unknown'` yerine `undefined` geçiliyor
   - Başarılı işlemlerde `result.data?._id || 'unknown'` yerine sadece `result.data?._id` kullanılıyor

## Değişiklikler

### models/AuditLog.ts
```typescript
resourceId: {
  type: mongoose.Schema.Types.ObjectId,
  required: false // Başarısız işlemlerde null olabilir (örn: CREATE işlemi başarısız olduğunda)
},
```

### src/services/audit.service.ts
```typescript
export interface AuditLogData {
  // ...
  resourceId?: string; // Başarısız işlemlerde undefined olabilir
  // ...
}
```

### src/controllers/customer.controller.ts & opportunity.controller.ts
```typescript
// Eski kod:
await AuditService.logFailure(
  // ...
  'unknown', // ❌ Hata veriyordu
  result.error!,
  request
);

// Yeni kod:
await AuditService.logFailure(
  // ...
  result.error!,
  undefined, // ✅ Başarısız işlemde resourceId yok
  request
);
```

## Test
`test-audit-log.js` dosyası ile değişikliklerin doğru çalıştığı test edilebilir.

## Sonuç
Bu değişikliklerle birlikte:
- ✅ Başarılı işlemlerde audit log normal şekilde kaydedilir
- ✅ Başarısız işlemlerde audit log hata vermeden kaydedilir
- ✅ MongoDB ObjectId validation hatası çözülür
- ✅ Audit log sistemi daha esnek hale gelir
