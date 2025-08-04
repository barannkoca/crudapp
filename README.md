# CRUD Başvuru Yönetim Sistemi
fundamentals
Modern web teknolojileri kullanılarak geliştirilmiş, kapsamlı bir başvuru yönetim sistemi. Bu proje, kullanıcı dostu arayüzü ve güçlü backend yapısıyla başvuruların etkin yönetimini sağlar.

## 🚀 Özellikler

### 📋 Başvuru Yönetimi
- Yeni başvuru oluşturma ve düzenleme
- PDF ve fotoğraf yükleme desteği
- Otomatik form doldurma (PDF'den veri çıkarma)
- Başvuru durumu takibi (Beklemede, Onaylandı, Reddedildi)
- Geçerlilik tarihi yönetimi

### 🔍 Gelişmiş Filtreleme Sistemi
- Başvuru türüne göre filtreleme
- İl bazlı filtreleme
- Durum filtreleme
- Tarih aralığı filtreleme
- Ad-soyad ve kayıt no ile arama
- SOLID prensiplerine uygun filtreleme mimarisi

### 📊 Veri Görüntüleme
- Sayfalama sistemi
- Detaylı başvuru görüntüleme
- PDF indirme özelliği
- Responsive tasarım

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
- SOLID Prensipleri
- Service Pattern
- Clean Architecture
- Responsive Design
- Type-Safe Development

## 🏗️ Proje Yapısı

```
├── app/
│   ├── api/           # API endpoints
│   └── pages/         # Sayfa bileşenleri
├── components/        # UI bileşenleri
├── services/         # İş mantığı servisleri
│   ├── filters/      # Filtreleme sistemi
│   └── ...
├── types/           # TypeScript tipleri
├── schemas/         # Veri şemaları
└── lib/            # Yardımcı fonksiyonlar
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
