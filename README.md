# CRUD Başvuru Yönetim Sistemi

Modern web teknolojileri kullanılarak geliştirilmiş, kapsamlı bir başvuru yönetim sistemi. Bu proje, kullanıcı dostu arayüzü ve güçlü backend yapısıyla başvuruların etkin yönetimini sağlar.

## 🚀 Özellikler

### 📋 Başvuru Yönetimi
- **Çoklu Başvuru Türleri**: Çalışma İzni, İkamet İzni, Diğer İşlemler
- **Dinamik Form Sistemi**: Tür bazlı özelleştirilmiş formlar
- **Stepper Form UI**: Çok adımlı form navigasyonu
- **PDF ve Fotoğraf Yükleme**: Güvenli dosya yükleme
- **Durum Takibi**: Gerçek zamanlı başvuru durumu izleme
- **Açıklama Sistemi**: Yapılandırılmış not ve açıklama yönetimi

### 🔍 Gelişmiş Filtreleme ve Arama Sistemi
- **Tür Bazlı Filtreleme**: Çalışma izni, İkamet izni, Diğer işlemler
- **Genel Arama**: Tüm detaylar içinde anlık arama
- **Tarih Bazlı Sıralama**: Oluşturma/Güncelleme tarihine göre sıralama
- **Durum Filtreleme**: Başvuru durumu bazlı filtreleme
- **Tarih Aralığı**: Esnek tarih aralığı filtreleme
- **SOLID Mimarili**: Genişletilebilir filtreleme sistemi

### 📊 Veri Görüntüleme ve Analiz
- **Akıllı Sayfalama**: Performans optimizasyonu ile hızlı yükleme
- **Polymorphic Veri Yapısı**: Esnek detay alanları
- **PDF ve Dosya Yönetimi**: Güvenli dosya indirme
- **İstatistik Dashboard**: Başvuru ve ödeme istatistikleri
- **Responsive Tasarım**: Tüm cihazlarda uyumlu arayüz

## 🛠️ Kullanılan Teknolojiler

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Hook Form
- date-fns
- Lucide Icons

### Backend
- Next.js API Routes
- MongoDB
- NextAuth.js
- PDF İşleme (pdf-ts)

### Mimari
- **Katmanlı Mimari (Layered Architecture)**
- **SOLID Prensipleri**
- **Clean Architecture**
- **Repository Pattern**
- **Service Pattern**
- **DTO Pattern**
- **Dependency Injection**
- **Type-Safe Development**
- **Error Handling Middleware**

## 🏗️ Proje Yapısı

```
├── app/
│   ├── api/           # Next.js API routes
│   ├── auth/          # Authentication sayfaları
│   ├── customers/     # Müşteri sayfaları
│   ├── dashboard/     # Dashboard sayfası
│   └── ...
├── src/               # Katmanlı mimari
│   ├── controllers/   # HTTP istekleri ve API endpoint'leri
│   ├── services/      # İş mantığı katmanı
│   ├── repositories/  # Veri erişim katmanı
│   ├── dto/          # Data Transfer Objects
│   ├── middlewares/  # Error handling ve middleware'ler
│   ├── utils/        # Yardımcı fonksiyonlar
│   └── constants/    # Sistem sabitleri
├── components/        # React UI bileşenleri
├── models/           # MongoDB Mongoose modelleri
├── types/           # TypeScript tipleri
├── schemas/         # Zod validation şemaları
└── lib/            # Konfigürasyon ve yardımcı fonksiyonlar
```

## 🌟 Öne Çıkan Özellikler

1. **Modüler Tasarım**
   - Bağımsız ve yeniden kullanılabilir bileşenler
   - Kolay bakım ve geliştirme
   - Test edilebilir kod yapısı

2. **Performans Optimizasyonu**
   - Sayfalama ile verimli veri yükleme
   - Optimized image loading
   - Lazy loading

3. **Güvenlik**
   - Oturum yönetimi
   - API route koruması
   - Input validasyonu

4. **Kullanıcı Deneyimi**
   - Sezgisel arayüz
   - Responsive tasarım
   - Anlık bildirimler
   - Gelişmiş filtreleme ve arama

## 🚀 Kurulum

```bash
# Depoyu klonlayın
git clone [repo-url]

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

## 🔧 Ortam Değişkenleri

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🤝 Katkıda Bulunma

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 👤 Geliştirici

Baran Koca
- LinkedIn: [Baran Koca](https://www.linkedin.com/in/baran-koca-6a330a217/)
- GitHub: [@barannkoca](https://github.com/barannkoca)
