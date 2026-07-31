import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  department: {
    type: String
  },
  college: {
    type: String
  },
  skills: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  resumePath: {
    type: String,
    default: null
  },
  avatarUrl: {
    type: String,
    default: function() {
      // Generate a default DiceBear avatar based on the user's name
      // We'll replace spaces with pluses for the URL
      const formattedName = this.name ? this.name.replace(/\s+/g, '+') : 'User';
      return `https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}&backgroundColor=6366f1,3b82f6,8b5cf6&textColor=ffffff`;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
