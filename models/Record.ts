import mongoose from 'mongoose';
import { ILLER, ISLEMLER } from '@/schemas/userRecordSchema';

// Eğer model zaten varsa önce kaldır
if (mongoose.models.Record) {
  delete mongoose.models.Record;
}

const recordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  kayit_ili: {
    type: String,
    enum: ILLER,
    required: true,
  },
  yapilan_islem: {
    type: String,
    enum: ISLEMLER,
    required: true,
  },
  kayit_tarihi: {
    type: Date,
    required: true,
  },
  kayit_numarasi: {
    type: String,
    required: true,
  },
  adi: {
    type: String,
    required: true,
    minlength: 2,
  },
  soyadi: {
    type: String,
    required: true,
    minlength: 2,
  },
  baba_adi: {
    type: String,
    default: undefined,
  },
  anne_adi: {
    type: String,
    default: undefined,
  },
  yabanci_kimlik_no: {
    type: String,
    default: undefined,
  },
  uyrugu: {
    type: String,
    default: undefined,
  },
  cinsiyeti: {
    type: String,
    enum: ["Erkek", "Kadın"],
    required: true,
  },
  medeni_hali: {
    type: String,
    default: undefined,
  },
  dogum_tarihi: {
    type: Date,
    default: undefined,
  },
  belge_turu: {
    type: String,
    default: undefined,
  },
  belge_no: {
    type: String,
    default: undefined,
  },
  telefon_no: {
    type: String,
    required: true,
    match: /^\d{10,}$/,
  },
  eposta: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  aciklama: {
    type: String,
    default: undefined,
  },
  photo: {
    data: {
      type: String,
      default: undefined,
    },
    contentType: {
      type: String,
      default: undefined,
    },
    _id: false,
  },
  kayit_pdf: {
    data: {
      type: String,
      default: undefined,
    },
    contentType: {
      type: String,
      default: undefined,
    },
    _id: false,
  },
  durum: {
    type: String,
    enum: ['beklemede', 'onaylandi', 'reddedildi'],
    default: 'beklemede'
  },
  gecerlilik_tarihi: {
    type: Date,
    default: undefined,
  }
}, {
  timestamps: true,
  strict: true
});

// Modeli yeniden oluştur
export const Record = mongoose.model('Record', recordSchema); 