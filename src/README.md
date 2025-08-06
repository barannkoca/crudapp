# Katmanlı Mimari Dokümantasyonu

Bu proje için katmanlı mimari yapısı oluşturulmuştur. Bu dokümantasyon, sistem mimarisini ve kullanımını açıklamaktadır.

## Mimari Genel Bakış

Proje aşağıdaki katmanlardan oluşmaktadır:

```
src/
├── controllers/     # API endpoint'leri ve HTTP istekleri
├── services/        # İş mantığı katmanı
├── repositories/    # Veri erişim katmanı
├── dto/            # Data Transfer Objects
├── middlewares/    # Middleware'ler
├── utils/          # Yardımcı fonksiyonlar
└── constants/      # Sabitler
```

## Katmanlar

### 1. Controller Katmanı (`controllers/`)

**Sorumluluklar:**
- HTTP isteklerini karşılar
- Request/Response dönüşümlerini yapar
- Authentication kontrolü
- Validation
- Error handling

**Dosyalar:**
- `base.controller.ts` - Tüm controller'lar için ortak fonksiyonlar
- `customer.controller.ts` - Müşteri API endpoint'leri
- `opportunity.controller.ts` - Fırsat API endpoint'leri

**Örnek Kullanım:**
```typescript
const customerController = new CustomerController();
export const GET = ErrorHandler.asyncWrapper(async (request: NextRequest) => {
  return await customerController.getCustomers(request);
});
```

### 2. Service Katmanı (`services/`)

**Sorumluluklar:**
- İş mantığını uygular
- Repository katmanını kullanır
- Validation kurallarını içerir
- Business rules'ları yönetir

**Dosyalar:**
- `base.service.ts` - Tüm service'ler için ortak fonksiyonlar
- `customer.service.ts` - Müşteri iş mantığı
- `opportunity.service.ts` - Fırsat iş mantığı

**Örnek Kullanım:**
```typescript
const customerService = new CustomerService();
const result = await customerService.create(createDto);
```

### 3. Repository Katmanı (`repositories/`)

**Sorumluluklar:**
- Veritabanı operasyonları
- CRUD işlemleri
- Sorgular ve filtreleme
- Data mapping

**Dosyalar:**
- `base.repository.ts` - Tüm repository'ler için CRUD operasyonları
- `customer.repository.ts` - Müşteri veri erişimi
- `opportunity.repository.ts` - Fırsat veri erişimi

**Örnek Kullanım:**
```typescript
const customerRepository = new CustomerRepository();
const customers = await customerRepository.findByFilters(filters, pagination);
```

### 4. DTO Katmanı (`dto/`)

**Sorumluluklar:**
- API contract'ları tanımlar
- Type safety sağlar
- Request/Response şemaları

**Dosyalar:**
- `base.dto.ts` - Ortak DTO'lar ve interface'ler
- `customer.dto.ts` - Müşteri DTO'ları
- `opportunity.dto.ts` - Fırsat DTO'ları

### 5. Middleware Katmanı (`middlewares/`)

**Sorumluluklar:**
- Error handling
- Authentication/Authorization
- Request preprocessing

**Dosyalar:**
- `error-handler.middleware.ts` - Merkezi hata yönetimi

### 6. Utils Katmanı (`utils/`)

**Sorumluluklar:**
- Yardımcı fonksiyonlar
- Validation utilities
- Response helpers

**Dosyalar:**
- `response.utils.ts` - Response yardımcı fonksiyonları
- `validation.utils.ts` - Validation yardımcı fonksiyonları

## Veri Akışı

```
Request → Controller → Service → Repository → Database
                ↓
Response ← Controller ← Service ← Repository ← Database
```

1. **Request**: HTTP isteği Controller katmanına gelir
2. **Controller**: İsteği parse eder, auth kontrolü yapar
3. **Service**: İş mantığını uygular, validation yapar
4. **Repository**: Veritabanı operasyonlarını gerçekleştirir
5. **Response**: Sonuç tersine aynı yoldan döner

## Error Handling

Merkezi error handling sistemi kullanılmaktadır:

```typescript
// Controller'da
export const GET = ErrorHandler.asyncWrapper(async (request: NextRequest) => {
  return await customerController.getCustomers(request);
});

// Service'te
if (!result.success) {
  throw new ValidationError('Geçersiz veri');
}
```

## Validation

İki seviyeli validation:
1. **DTO Level**: TypeScript types ile compile-time validation
2. **Service Level**: Business rules ile runtime validation

```typescript
// Service validation örneği
protected async validateCreate(createDto: CreateCustomerDto): Promise<{isValid: boolean; errors: any[]}> {
  const errors: any[] = [];
  
  if (!createDto.ad?.trim()) {
    errors.push({ field: 'ad', message: 'Ad alanı zorunludur' });
  }
  
  return { isValid: errors.length === 0, errors };
}
```

## Dependency Injection

Constructor injection kullanılmaktadır:

```typescript
export class CustomerService extends BaseService<...> {
  private customerRepository: CustomerRepository;

  constructor() {
    const repository = new CustomerRepository();
    super(repository);
    this.customerRepository = repository;
  }
}
```

## API Response Format

Standardize edilmiş response formatı:

```typescript
// Success Response
{
  "success": true,
  "data": {...},
  "message": "İşlem başarılı"
}

// Error Response
{
  "success": false,
  "error": "Hata mesajı"
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Kullanım Örnekleri

### Yeni Entity Ekleme

1. **DTO oluştur**: `src/dto/entity.dto.ts`
2. **Repository oluştur**: `src/repositories/entity.repository.ts`
3. **Service oluştur**: `src/services/entity.service.ts`
4. **Controller oluştur**: `src/controllers/entity.controller.ts`
5. **API Route'u ekle**: `app/api/entities/route.ts`

### Mevcut Entity'yi Genişletme

1. DTO'ya yeni alanlar ekle
2. Repository'de yeni metodlar ekle
3. Service'te business logic ekle
4. Controller'da yeni endpoint'ler ekle

## Polymorphic Veri Yapısı (detaylar Field)

### Konsept
Opportunity modelinde `detaylar` field'ı **Polymorphic Pattern** kullanır. Bu yaklaşım, farklı opportunity türleri için farklı veri yapılarının tek bir field içinde depolanmasını sağlar.

### Teknik Implementasyon

```typescript
// MongoDB Schema
detaylar: {
  type: mongoose.Schema.Types.Mixed,  // Herhangi bir veri yapısı
  default: {},
  index: true
}

// TypeScript Interfaces
interface IFirsat {
  detaylar?: any;  // Runtime'da type-safe casting
}

interface ICalismaIzniFirsati extends IFirsat {
  detaylar: {
    isveren: string;
    pozisyon: string;
    maas: number;
    // ...
  };
}
```

### Avantajları

1. **Schema Flexibility**: Yeni opportunity türleri için schema değişikliği gerektirmez
2. **Type Safety**: TypeScript interfaces ile compile-time güvenlik
3. **Query Performance**: MongoDB dot notation ile etkili sorgular
4. **Maintainability**: Tek model ile tüm türleri yönetim

### Örnek Veri Yapıları

```json
// Çalışma İzni
{
  "islem_turu": "calisma_izni",
  "detaylar": {
    "isveren": "ABC Şirketi",
    "pozisyon": "Mühendis",
    "maas": 15000,
    "calisma_saati": 40
  }
}

// İkamet İzni
{
  "islem_turu": "ikamet_izni", 
  "detaylar": {
    "yapilan_islem": "Yenileme",
    "ikamet_turu": "Öğrenci",
    "kayit_numarasi": "12345"
  }
}

// Diğer İşlemler
{
  "islem_turu": "diger",
  "detaylar": {
    "islem_adi": "Vize Başvurusu",
    "baslama_tarihi": "2024-01-15"
  }
}
```

### Sorgu Örnekleri

```typescript
// Dot notation ile nested field sorguları
await OpportunityModel.find({
  'detaylar.isveren': { $regex: searchTerm, $options: 'i' }
});

// Çoklu field arama
await OpportunityModel.find({
  $or: [
    { 'detaylar.isveren': { $regex: searchTerm, $options: 'i' }},
    { 'detaylar.pozisyon': { $regex: searchTerm, $options: 'i' }},
    { 'detaylar.kayit_numarasi': { $regex: searchTerm, $options: 'i' }}
  ]
});
```

## Best Practices

1. **Single Responsibility**: Her katman sadece kendi sorumluluğuyla ilgilensin
2. **Dependency Direction**: Üst katmanlar alt katmanlara bağımlı olsun
3. **Error Handling**: Her katman kendi seviyesinde error handle etsin
4. **Type Safety**: TypeScript'in type güvenliğini kullanın
5. **Async/Await**: Promise'ler yerine async/await kullanın
6. **Logging**: Her katmanda uygun logging yapın
7. **Polymorphic Design**: `detaylar` field'ında consistent veri yapıları kullanın

## Geliştirme Rehberi

### Yeni Özellik Ekleme

1. DTO'ları güncelle
2. Repository'de veri erişim metodları ekle
3. Service'te business logic implementasyonu yap
4. Controller'da endpoint'leri ekle
5. Test yazın

### Hata Ayıklama

1. Error logs'ları kontrol et
2. Her katmanın sorumluluğunu doğrula
3. Type safety'yi kontrol et
4. Validation kurallarını gözden geçir

Bu mimari yapısı ile kod maintainability, testability ve scalability önemli ölçüde artırılmıştır.