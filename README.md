# 🚀 CRUD App - CRM Sistemi

Müşteri ilişkileri, fırsat takibi ve finansal süreçleri yönetmek için geliştirilmiş kapsamlı bir CRM uygulamasıdır. Next.js ve MongoDB altyapısı üzerine inşa edilmiştir.

## 🌟 Özellikler

- **📊 Dashboard**: Genel durum özeti, grafikler ve istatistikler.
- **👥 Müşteri Yönetimi**: Müşteri ekleme, düzenleme ve detaylı profil görüntüleme.
- **📁 İşlemler & Fırsatlar**:
    - **İkamet İzni**: İkamet izni süreçlerinin takibi.
    - **Çalışma İzni**: Çalışma izni başvurularının yönetimi.
    - **Diğer İşlemler**: Çeşitli hizmet süreçlerinin takibi.
- **💰 Finansal Takip**: Bekleyen ödemeler ve tahsilat takibi.
- **📈 Analitik**: Satış ve müşteri verilerinin analizi.
- **🛡️ Audit Log**: Yapılan işlemlerin kayıt altına alınması.

## 🛠️ Teknolojiler

- **Frontend & Framework**: [Next.js 15](https://nextjs.org/), React 19
- **Dil**: TypeScript
- **Veritabanı**: MongoDB, Mongoose
- **Genel Stil & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **İkonlar**: Lucide React, React Icons
- **Grafikler**: Chart.js, React Chartjs 2

## 🚀 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1. **Bağımlılıkları Yükleyin**
   ```bash
   npm install
   ```

2. **Çevresel Değişkenleri Ayarlayın**
   `.env` dosyasını oluşturun ve gerekli veritabanı bağlantı bilgilerini ekleyin (`MONGODB_URI` vb.).

3. **Geliştirme Sunucusunu Başlatın**
   ```bash
   npm run dev
   ```
   Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📦 Migration & Scriptler

Proje, verileri yönetmek ve test verisi oluşturmak için çeşitli yardımcı araçlar içerir.

### Hızlı Komutlar (Makefile)

- `make setup`: Test verilerini import eder.
- `make migrate`: Fotoğraf ve PDF migrasyonlarını çalıştırır.
- `make check`: Migrasyon sonuçlarını kontrol eder.
- `make all`: Tüm süreci sırasıyla çalıştırır.

Detaylı script dokümantasyonu için [scripts/README.md](scripts/README.md) dosyasını inceleyebilirsiniz.

## 📂 Proje Yapısı

```
crudapp/
├── app/                  # Next.js App Router sayfaları
├── components/           # UI bileşenleri
├── models/               # Mongoose veritabanı şemaları
├── lib/                  # Yardımcı fonksiyonlar ve servisler
├── scripts/              # Migration ve veri scriptleri
└── public/               # Statik dosyalar
```
