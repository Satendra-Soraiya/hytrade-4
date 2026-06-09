const { Schema, model } = require('mongoose');

const SessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    deviceInfo: {
      userAgent: { type: String, default: 'Unknown' },
      ipAddress: { type: String, default: 'Unknown' },
      deviceType: { type: String, default: 'unknown' },
    },
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    loggedOutAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'sessions_v2' }
);

SessionSchema.methods.deactivate = async function deactivate() {
  this.isActive = false;
  this.loggedOutAt = new Date();
  await this.save();
};

SessionSchema.methods.updateActivity = async function updateActivity() {
  this.lastActivity = new Date();
  await this.save();
};

SessionSchema.statics.cleanExpiredSessions = async function cleanExpiredSessions() {
  const result = await this.deleteMany({ expiresAt: { $lt: new Date() } });
  return result.deletedCount || 0;
};

SessionSchema.statics.getActiveSessions = function getActiveSessions(userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ lastActivity: -1 });
};

const Session = model('Session', SessionSchema);

module.exports = { Session };
