import mongoose from 'mongoose';
import { TURKISH_PROVINCES, ISLEMLER } from '@/schemas/userRecordSchema';

const recordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  kayit_ili: {
    type: String,
    enum: TURKISH_PROVINCES,
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
  },
  anne_adi: {
    type: String,
  },
  yabanci_kimlik_no: {
    type: String,
  },
  uyrugu: {
    type: String,
  },
  cinsiyeti: {
    type: String,
    enum: ["Erkek", "Kadın"],
    required: true,
  },
  medeni_hali: {
    type: String,
  },
  dogum_tarihi: {
    type: Date,
  },
  belge_turu: {
    type: String,
  },
  belge_no: {
    type: String,
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
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  kayit_pdf: {
    data: Buffer,
    contentType: String,
  },
  durum: {
    type: String,
    enum: ['beklemede', 'onaylandi', 'reddedildi'],
    default: 'beklemede'
  }
}, {
  timestamps: true
});

export const Record = mongoose.models.Record || mongoose.model('Record', recordSchema); 