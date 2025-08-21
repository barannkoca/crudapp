import mongoose from 'mongoose';

// Ücret şeması
const UcretSchema = new mongoose.Schema({
  miktar: { type: Number, required: true },
  para_birimi: { 
    type: String, 
    enum: ['TRY', 'USD', 'EUR', 'GBP'],
    required: true 
  },
  aciklama: { type: String },
  odeme_tarihi: { type: Date },
  odeme_durumu: { 
    type: String, 
    enum: ['beklemede', 'odendi', 'iptal_edildi'],
    default: 'beklemede'
  }
}, { _id: false });

// Açıklama şeması
const AciklamaSchema = new mongoose.Schema({
  baslik: { type: String, required: true },
  icerik: { type: String, required: true },
  tarih: { type: Date, default: Date.now },
  yazan_kullanici: { type: String },
  onem_derecesi: { 
    type: String, 
    enum: ['dusuk', 'orta', 'yuksek'],
    default: 'orta'
  }
}, { _id: false });

// PDF dosyası şeması
const PdfDosyaSchema = new mongoose.Schema({
  data: { type: String, required: true },
  contentType: { type: String, required: true }
}, { _id: false });

const OpportunitySchema = new mongoose.Schema({
  // Ana alanlar (tüm fırsat türleri için ortak)
  musteri: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  islem_turu: {
    type: String,
    enum: ['calisma_izni', 'ikamet_izni', 'diger'],
    required: true,
  },
  durum: {
    type: String,
    enum: ['beklemede', 'islemde', 'onaylandi', 'reddedildi', 'tamamlandi', 'iptal_edildi'],
    default: 'beklemede',
    required: true,
  },
  olusturma_tarihi: { type: Date, default: Date.now },
  guncelleme_tarihi: { type: Date },
  
  // Ortak alanlar
  aciklamalar: [AciklamaSchema],
  ucretler: [UcretSchema],
  pdf_dosya: PdfDosyaSchema, // Ortak PDF alanı
  
  // İşlem türüne özel detaylar (JSON olarak esnek - tüm özel alanlar burada)
  detaylar: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
}, {
  timestamps: true,
  strict: true
});

// Pre-save middleware for data integrity
OpportunitySchema.pre('save', function(next) {
  // Güncelleme tarihini set et
  this.guncelleme_tarihi = new Date();
  
  // Detaylar alanını sanitize et
  if (this.detaylar) {
    // Circular reference kontrolü
    try {
      JSON.stringify(this.detaylar);
    } catch (error) {
      return next(new Error('Detaylar alanında circular reference'));
    }
    
    // JSON size kontrolü (50KB limit)
    const jsonSize = Buffer.byteLength(JSON.stringify(this.detaylar), 'utf8');
    if (jsonSize > 50 * 1024) {
      return next(new Error('Detaylar alanı çok büyük (max 50KB)'));
    }
  }
  
  next();
});

// Performans için indeksler
OpportunitySchema.index({ musteri: 1, islem_turu: 1 }); // Müşteriye ait fırsatları getirirken
OpportunitySchema.index({ islem_turu: 1, olusturma_tarihi: -1 }); // Fırsat türüne göre sıralama
OpportunitySchema.index({ durum: 1, islem_turu: 1 }); // Durum ve tür filtreleme
OpportunitySchema.index({ olusturma_tarihi: -1 }); // Genel sıralama

// Detaylar alanı için indeksler (esnek alanlar)
OpportunitySchema.index({ 'detaylar.isveren': 1 }, { sparse: true }); // Çalışma izni
OpportunitySchema.index({ 'detaylar.kayit_numarasi': 1 }, { sparse: true }); // İkamet izni
OpportunitySchema.index({ 'detaylar.islem_adi': 1 }, { sparse: true }); // Diğer işlemler

// Ödeme ve açıklama indeksler
OpportunitySchema.index({ 'ucretler.odeme_durumu': 1 }); // Ödeme durumu filtreleme
OpportunitySchema.index({ 'aciklamalar.tarih': -1 }); // Açıklama tarihi sıralama

export const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);