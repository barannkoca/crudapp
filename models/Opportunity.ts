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
  
  // Yeni eklenen alanlar
  aciklamalar: [AciklamaSchema],
  ucretler: [UcretSchema],
  genel_aciklama: { type: String },
  
  // Çalışma İzni alanları
  isveren: { type: String },
  pozisyon: { type: String },
  sozlesme_turu: { type: String },
  calisma_baslama_tarihi: { type: Date },
  calisma_bitis_tarihi: { type: Date },
  maas: { type: Number },
  calisma_saati: { type: Number },
  is_yeri_adresi: { type: String },
  is_yeri_telefonu: { type: String },
  calisma_aciklama: { type: String },
  
  // İkamet İzni alanları (Record.ts ile eşleşen)
  kayit_ili: { type: String },
  yapilan_islem: { type: String },
  ikamet_turu: { type: String },
  kayit_tarihi: { type: String },
  kayit_numarasi: { type: String },
  aciklama: { type: String },
  gecerlilik_tarihi: { type: String },
  sira_no: { type: Number },
  randevu_tarihi: { type: String },
  kayit_pdf: {
    data: { type: String },
    contentType: { type: String },
    _id: false
  },
  
  // Diğer İşlem alanları
  islem_adi: { type: String },
  diger_baslama_tarihi: { type: Date },
  diger_bitis_tarihi: { type: Date },
  diger_aciklama: { type: String },
  ek_bilgiler: { type: String },
  
}, {
  timestamps: true,
  strict: true
});

// Performans için indeksler
OpportunitySchema.index({ musteri: 1, islem_turu: 1 }); // Müşteriye ait fırsatları getirirken
OpportunitySchema.index({ islem_turu: 1, olusturma_tarihi: -1 }); // Fırsat türüne göre sıralama
OpportunitySchema.index({ durum: 1, islem_turu: 1 }); // Durum ve tür filtreleme
OpportunitySchema.index({ olusturma_tarihi: -1 }); // Genel sıralama

// Sparse indeksler (sadece dolu alanlar için)
OpportunitySchema.index({ kayit_numarasi: 1 }, { sparse: true }); // İkamet izni için
OpportunitySchema.index({ isveren: 1 }, { sparse: true }); // Çalışma izni için
OpportunitySchema.index({ islem_adi: 1 }, { sparse: true }); // Diğer işlemler için

// Yeni alanlar için indeksler
OpportunitySchema.index({ 'ucretler.odeme_durumu': 1 }); // Ödeme durumu filtreleme
OpportunitySchema.index({ 'aciklamalar.tarih': -1 }); // Açıklama tarihi sıralama

export const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);