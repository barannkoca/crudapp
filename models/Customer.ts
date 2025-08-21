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

// Index'ler ve constraintler
customerSchema.index({ ad: 1, soyad: 1 });
customerSchema.index({ yabanci_kimlik_no: 1 }, { unique: true, sparse: true });
customerSchema.index({ eposta: 1 }, { unique: true, sparse: true });
customerSchema.index({ telefon_no: 1 });

// Pre-save middleware for data integrity
customerSchema.pre('save', function(next) {
  // Ad ve soyad'ı sanitize et
  if (this.ad) {
    this.ad = this.ad.trim().replace(/[<>]/g, '');
  }
  if (this.soyad) {
    this.soyad = this.soyad.trim().replace(/[<>]/g, '');
  }
  
  // Email'i lowercase yap
  if (this.eposta) {
    this.eposta = this.eposta.toLowerCase().trim();
  }
  
  // Telefon numarasını temizle
  if (this.telefon_no) {
    this.telefon_no = this.telefon_no.replace(/\D/g, '');
  }
  
  next();
});

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema); 