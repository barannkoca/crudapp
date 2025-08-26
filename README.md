# 🚀 CRUD App - Migration Sistemi

Bu proje, test veritabanındaki fotoğraf ve PDF verilerini yeni sisteme migrate etmek için geliştirilmiş bir otomasyon sistemidir.

## 🎯 Özellikler

- ✅ **Otomatik Migration**: Makefile ile tek komutla tüm işlemler
- ✅ **Fotoğraf Migrasyonu**: Müşteri fotoğraflarını otomatik aktarım
- ✅ **PDF Migrasyonu**: İkamet izni PDF'lerini otomatik aktarım
- ✅ **Detaylı Raporlama**: Migration sonuçlarını detaylı kontrol
- ✅ **Yedekleme Sistemi**: Veritabanı yedekleme ve geri yükleme
- ✅ **Hata Yönetimi**: Kapsamlı hata yakalama ve loglama

## 🚀 Hızlı Başlangıç

### Tek Komutla Tüm Migration
```bash
make all
```

### Adım Adım Migration
```bash
make setup    # Test verilerini import et
make migrate  # Fotoğraf ve PDF'leri migrate et
make check    # Sonuçları kontrol et
```

## 📊 Son Migration Sonuçları

- **94 müşteri** başarıyla oluşturuldu
- **94 ikamet izni fırsatı** başarıyla oluşturuldu
- **94 müşteri fotoğrafı** başarıyla eklendi (%100 başarı)
- **94 PDF** başarıyla ikamet iznine eklendi (%100 başarı)

## 🛠️ Kullanılabilir Komutlar

```bash
make help         # Tüm komutları göster
make all          # Tüm migration işlemlerini çalıştır
make setup        # Test verilerini import et
make migrate      # Fotoğraf ve PDF'leri migrate et
make check        # Sonuçları kontrol et
make status       # Mevcut durumu göster
make report       # Detaylı rapor oluştur
make backup       # Veritabanı yedeği al
make clean        # Log dosyalarını temizle
```

## 📁 Proje Yapısı

```
crudapp/
├── Makefile                    # Otomatik migration komutları
├── scripts/                    # Migration scriptleri
│   ├── import-test-data.js     # Test verilerini import eder
│   ├── migrate-photos-and-pdfs.js  # Fotoğraf ve PDF'leri migrate eder
│   ├── check-migration-results.js  # Sonuçları kontrol eder
│   └── README.md              # Detaylı dokümantasyon
├── .env                        # Veritabanı bağlantı bilgileri
└── README.md                   # Bu dosya
```

## 🔧 Gereksinimler

- Node.js (v14+)
- MongoDB
- Make (Unix/Linux/macOS)

## 📝 Detaylı Dokümantasyon

Daha detaylı bilgi için [scripts/README.md](scripts/README.md) dosyasını inceleyin.

## 🎉 Başarı!

Migration sistemi başarıyla kuruldu ve çalışıyor! Artık tek komutla tüm migration işlemlerini otomatik olarak gerçekleştirebilirsiniz.
