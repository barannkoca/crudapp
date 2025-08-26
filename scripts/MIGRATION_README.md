# MongoDB Cloud Migration Rehberi

Bu rehber, yerel MongoDB veritabanınızdan MongoDB Cloud (Atlas) veritabanına veri migration'ı yapmanızı sağlar.

## 🚀 Hızlı Başlangıç

### 1. MongoDB Cloud (Atlas) Kurulumu

1. [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı oluşturun
2. Yeni bir cluster oluşturun (M0 Free tier yeterli)
3. Database Access'te kullanıcı oluşturun
4. Network Access'te IP adresinizi ekleyin (veya 0.0.0.0/0 ile tüm IP'lere izin verin)
5. Connect butonuna tıklayıp connection string'i alın

### 2. Environment Variables Ayarlama

`scripts/env.example` dosyasını `scripts/.env` olarak kopyalayın ve değerleri güncelleyin:

```bash
# Yerel MongoDB bağlantısı (kaynak)
LOCAL_MONGODB_URI=mongodb://localhost:27017/crudapp
LOCAL_DB_NAME=crudapp

# MongoDB Cloud (Atlas) bağlantısı (hedef)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crudapp?retryWrites=true&w=majority
DB_NAME=crudapp

# Migration ayarları
CLEAR_CLOUD_COLLECTIONS=false
```

### 3. Migration Çalıştırma

```bash
# Cloud'a migration yap
npm run migrate:cloud

# Migration'ı doğrula
npm run migrate:validate

# Yerel migration (eski verileri yeni formata çevir)
npm run migrate:local
```

## 📋 Migration Detayları

### Migrate Edilen Collection'lar

- **customers** - Müşteri bilgileri
- **opportunities** - Fırsat/İşlem bilgileri  
- **users** - Kullanıcı hesapları
- **auditlogs** - Audit log kayıtları

### Migration Özellikleri

- ✅ **Batch Processing** - Büyük veri setleri için 100'lük gruplar halinde işlem
- ✅ **Error Handling** - Hata durumunda devam etme
- ✅ **Duplicate Handling** - Aynı verileri atlama
- ✅ **Progress Tracking** - İlerleme takibi
- ✅ **Validation** - Migration sonrası doğrulama

## ⚙️ Gelişmiş Ayarlar

### Cloud Collection'ları Temizleme

Eğer cloud'da mevcut verileri silmek istiyorsanız:

```bash
CLEAR_CLOUD_COLLECTIONS=true npm run migrate:cloud
```

### Özel Collection Migration

Sadece belirli collection'ları migrate etmek için script'i düzenleyin:

```javascript
// migrate-to-cloud.js dosyasında
await migrateCollection(localDb, cloudDb, 'customers', 'Müşteriler');
// Diğer collection'ları yorum satırı yapın
```

## 🔍 Troubleshooting

### Bağlantı Hataları

```bash
# Bağlantıyı test et
mongosh "mongodb+srv://username:password@cluster.mongodb.net/crudapp"
```

### Yetki Hataları

- Database Access'te kullanıcının doğru yetkilere sahip olduğundan emin olun
- Network Access'te IP adresinizin eklendiğinden emin olun

### Timeout Hataları

Büyük veri setleri için timeout süresini artırın:

```javascript
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});
```

## 📊 Migration Sonrası Kontroller

1. **Veri Sayısı Kontrolü**
   ```bash
   npm run migrate:validate
   ```

2. **Örnek Veri Kontrolü**
   ```javascript
   // Cloud'da örnek veri kontrol et
   db.customers.findOne()
   db.opportunities.findOne()
   ```

3. **Uygulama Testi**
   - Uygulamayı cloud veritabanı ile çalıştırın
   - Temel işlevleri test edin

## 🔄 Rollback Planı

Migration başarısız olursa:

1. Cloud veritabanını temizleyin
2. Hataları düzeltin
3. Migration'ı tekrar çalıştırın

```bash
# Cloud'ı temizle (dikkatli kullanın!)
CLEAR_CLOUD_COLLECTIONS=true npm run migrate:cloud
```

## 📝 Notlar

- Migration sırasında uygulamayı durdurun
- Büyük veri setleri için yeterli zaman ayırın
- Migration öncesi veri yedeği alın
- Production'da test edin

## 🆘 Yardım

Sorun yaşarsanız:

1. Console çıktılarını kontrol edin
2. MongoDB Atlas loglarını inceleyin
3. Network bağlantınızı test edin
4. Environment variables'ları doğrulayın
