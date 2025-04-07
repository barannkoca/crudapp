import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function(this: any) {
      return !this.googleId;
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  image: String,
  googleId: String,
  corporate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Corporate',
    required: function(this: any) {
      return this.status === 'active';
    }
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member']
  },
  records: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Record'
  }]
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema); 