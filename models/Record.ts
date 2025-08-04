import mongoose from 'mongoose';
import { ILLER, ISLEMLER, IKAMET_TURU } from '@/schemas/userRecordSchema';

const recordSchema = new mongoose.Schema({
  musteri: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  islem_turu: {
    type: String,
    enum: ['kayit'],
    default: 'kayit',
    required: true,
  },
  durum: {
    type: String,
    enum: ['beklemede', 'onaylandi', 'reddedildi'],
    default: 'beklemede'
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
  ikamet_turu: {
    type: String,
    enum: IKAMET_TURU,
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
  aciklama: {
    type: String,
    default: undefined,
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
  gecerlilik_tarihi: {
    type: Date,
    default: undefined,
  },
  sira_no: {
    type: Number,
    default: undefined,
  },
  randevu_tarihi: {
    type: Date,
    default: undefined,
  }
}, {
  timestamps: true,
  strict: true
});

export const Record = mongoose.models.Record || mongoose.model('Record', recordSchema); 