import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  soyad: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  yabanci_kimlik_no: {
    type: String,
    default: undefined,
    trim: true,
  },
  uyrugu: {
    type: String,
    default: undefined,
    trim: true,
  },
  cinsiyeti: {
    type: String,
    enum: ["Erkek", "Kadın"],
    required: true,
  },
  telefon_no: {
    type: String,
    match: /^\d{10,}$/,
    trim: true,
  },
  eposta: {
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    trim: true,
    lowercase: true,
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
}, {
  timestamps: true,
  strict: true
});

// Index'ler ekleyelim
customerSchema.index({ ad: 1, soyad: 1 });
customerSchema.index({ yabanci_kimlik_no: 1 });
customerSchema.index({ eposta: 1 });

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema); 