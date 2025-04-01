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
  image: String,
  googleId: String,
  records: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Record'
  }]
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema); 