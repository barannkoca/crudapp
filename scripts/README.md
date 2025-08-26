# Migration Scripts

Bu klasör, test veritabanındaki verileri yeni sisteme migrate etmek için kullanılan scriptleri içerir.

## Scriptler

### 1. `import-test-data.js`
Test JSON dosyasından verileri doğrudan import eder.
- 94 müşteri ve ikamet izni fırsatı oluşturur
- Temel veri yapısını kurar

**Kullanım:**
```bash
node scripts/import-test-data.js
```

### 2. `migrate-photos-and-pdfs.js`
Fotoğrafları müşterilere ve PDF'leri ikamet iznine migrate eder.
- Müşteri fotoğraflarını `customers` collection'ına ekler
- PDF'leri `opportunities` collection'ındaki `pdf_dosyalari` array'ine ekler
- JSON dosyasındaki `kayit_pdf` alanından PDF verilerini okur

**Kullanım:**
```bash
node scripts/migrate-photos-and-pdfs.js
```

### 3. `check-migration-results.js`
Migration sonuçlarını kontrol eder ve istatistikler gösterir.
- Müşteri fotoğraf sayılarını kontrol eder
- İkamet izni PDF sayılarını kontrol eder
- Başarı oranlarını hesaplar

**Kullanım:**
```bash
node scripts/check-migration-results.js
```

### 4. `migrate-database.js`
Eski veritabanından yeni sisteme genel migration yapar.
- Eski collection'lardan veri aktarır
- Yeni veri yapısına dönüştürür

**Kullanım:**
```bash
node scripts/migrate-database.js
```

### 5. `add-customer-photos.js`
Sadece müşteri fotoğraflarını ekler.

**Kullanım:**
```bash
node scripts/add-customer-photos.js
```

### 6. `check-photos.js`
Müşteri fotoğraflarını kontrol eder.

**Kullanım:**
```bash
node scripts/check-photos.js
```

## Migration Süreci

### 🚀 Otomatik Migration (Önerilen)
```bash
make all
```

### 📋 Manuel Migration

#### Adım 1: Test Verilerini Import Et
```bash
make setup
# veya
node scripts/import-test-data.js
```

#### Adım 2: Fotoğraf ve PDF'leri Migrate Et
```bash
make migrate
# veya
node scripts/migrate-photos-and-pdfs.js
```

#### Adım 3: Sonuçları Kontrol Et
```bash
make check
# veya
node scripts/check-migration-results.js
```

## Sonuçlar

Son migration sonucunda:
- ✅ **94 müşteri** oluşturuldu
- ✅ **94 ikamet izni fırsatı** oluşturuldu
- ✅ **94 müşteri fotoğrafı** eklendi (%100 başarı)
- ✅ **94 PDF** ikamet iznine eklendi (%100 başarı)
- ✅ JSON dosyasındaki `kayit_pdf` alanından gerçek PDF verileri okundu

## Veri Yapısı

### Müşteri (Customer)
```javascript
{
  ad: String,
  soyad: String,
  photo: {
    data: Buffer,
    contentType: String
  },
  // ... diğer alanlar
}
```

### Fırsat (Opportunity)
```javascript
{
  musteri: ObjectId,
  islem_turu: 'ikamet_izni',
  pdf_dosyalari: [{
    data: Buffer,
    contentType: String,
    originalName: String,
    uploadDate: Date
  }],
  // ... diğer alanlar
}
```

## 🛠️ Makefile Kullanımı

Bu proje için otomatik migration işlemleri sağlayan bir Makefile oluşturuldu.

### 📋 Temel Komutlar
```bash
make help         # Tüm komutları göster
make all          # Tüm migration işlemlerini çalıştır
make setup        # Test verilerini import et
make migrate      # Fotoğraf ve PDF'leri migrate et
make check        # Sonuçları kontrol et
make status       # Mevcut durumu göster
make clean        # Log dosyalarını temizle
```

### 🔧 Gelişmiş Komutlar
```bash
make backup       # Veritabanı yedeği al
make restore      # Yedek geri yükle
make report       # Detaylı rapor oluştur
make dev          # Geliştirici modu
make reset        # Sistemi sıfırla ve yeniden başlat
```

### 📊 Kontrol Komutları
```bash
make check-photos # Sadece fotoğrafları kontrol et
make check-pdfs   # Sadece PDF'leri kontrol et
make test         # Hızlı test çalıştır
```

## Notlar

- Tüm scriptler MongoDB bağlantısı kullanır
- `.env` dosyasından `MONGODB_URI` ve `DB_NAME` değerlerini okur
- Hata durumunda detaylı log mesajları verir
- Migration işlemi geri alınabilir değildir (yedek alınması önerilir)
- Makefile ile tüm işlemler otomatize edilmiştir
