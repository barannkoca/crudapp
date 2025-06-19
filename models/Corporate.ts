import mongoose from 'mongoose';

const corporateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  logo: {
    type: String,  // URL veya Base64 string olarak tutulabilir
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    }
  }],
  records: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Record'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Define the interface
export interface ICorporate {
  name: string;
  logo?: string;
  owner: mongoose.Types.ObjectId;
  members?: Array<{
    user: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member';
  }>;
  records?: mongoose.Types.ObjectId[];
  createdAt?: Date;
}

// Model tekrar tanımlanmasın diye güvenli export
export const Corporate = mongoose.models.Corporate || mongoose.model<ICorporate>('Corporate', corporateSchema);
