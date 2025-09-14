const { Schema } = require("mongoose");

const SessionSchema = new Schema({
  // Session Identification
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'CustomUser',
    required: true,
    index: true
  },
  
  // Session Details
  token: {
    type: String,
    required: true,
    index: true
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    }
  },
  
  // Session Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Session Lifecycle
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  loggedOutAt: {
    type: Date,
    default: null
  },
  
  // Session Metadata
  loginLocation: {
    type: String,
    default: 'Unknown'
  },
  sessionType: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  }
});

// Indexes for better performance
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
SessionSchema.index({ lastActivity: 1 });

// Method to check if session is valid
SessionSchema.methods.isValid = function() {
  return this.isActive && new Date() < this.expiresAt;
};

// Method to update last activity
SessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Method to deactivate session
SessionSchema.methods.deactivate = function() {
  this.isActive = false;
  this.loggedOutAt = new Date();
  return this.save();
};

// Static method to clean expired sessions
SessionSchema.statics.cleanExpiredSessions = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
  return result.deletedCount;
};

// Static method to get active sessions for a user
SessionSchema.statics.getActiveSessions = async function(userId) {
  return this.find({
    userId: userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastActivity: -1 });
};

module.exports = { SessionSchema };
