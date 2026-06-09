const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    tradingExperience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
      default: 'Beginner',
    },
    riskTolerance: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    profilePicture: { type: String, default: 'default-1' },
    profilePictureType: { type: String, enum: ['default', 'custom', ''], default: 'default' },
    totalInvestmentPaise: { type: Number, default: 0 },
    totalPnLPaise: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'users' }
);

UserSchema.methods.isLocked = function isLocked() {
  return this.lockUntil && this.lockUntil > new Date();
};

const User = model('User', UserSchema);

module.exports = { User };
