const bcrypt = require('bcryptjs');
const { User } = require('../users/user.model');
const { config } = require('../../config/env');
const { generateJWT, validatePasswordStrength } = require('../../config/security');
const { initializeWalletForUser, ensureWalletForUser, getBalanceInr } = require('../wallet/wallet.service');
const { getInvestedPaise } = require('../users/user-totals.service');
const { SessionService } = require('./session.service');

async function mapUserResponse(user, accountBalance) {
  const investedPaise = await getInvestedPaise(user._id);
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    tradingExperience: user.tradingExperience,
    riskTolerance: user.riskTolerance,
    accountBalance,
    totalInvestment: investedPaise / 100,
    totalPnL: (user.totalPnLPaise || 0) / 100,
    isVerified: user.isVerified,
    isActive: user.isActive,
    profilePicture: user.profilePicture,
    profilePictureType: user.profilePictureType,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    updatedAt: user.updatedAt,
  };
}

async function registerUser(payload, req) {
  const { firstName, lastName, email, password, tradingExperience, riskTolerance } = payload;

  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    const err = new Error(strength.errors.join('; '));
    err.code = 'WEAK_PASSWORD';
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.code = 'EMAIL_EXISTS';
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    tradingExperience: tradingExperience || 'Beginner',
    riskTolerance: riskTolerance || 'Medium',
  });

  await initializeWalletForUser(user._id);
  const token = generateJWT({ userId: user._id, email: user.email, role: user.role });
  const session = await SessionService.createSession(user._id, token, req);
  const accountBalance = await getBalanceInr(user._id);

  return {
    token,
    sessionId: session.sessionId,
    user: await mapUserResponse(user, accountBalance),
    session: {
      id: session.sessionId,
      deviceInfo: session.deviceInfo,
      expiresAt: session.expiresAt,
    },
  };
}

async function loginUser({ email, password }, req) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  if (user.isLocked()) {
    const err = new Error('Account temporarily locked. Try again later.');
    err.code = 'ACCOUNT_LOCKED';
    err.status = 423;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is deactivated. Please contact support.');
    err.code = 'ACCOUNT_DEACTIVATED';
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= config.maxLoginAttempts) {
      user.lockUntil = new Date(Date.now() + config.lockoutTimeMs);
      user.loginAttempts = 0;
    }
    await user.save();
    const err = new Error('Invalid email or password');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  await ensureWalletForUser(user._id);

  const token = generateJWT({ userId: user._id, email: user.email, role: user.role });
  const session = await SessionService.createSession(user._id, token, req);
  const accountBalance = await getBalanceInr(user._id);

  return {
    token,
    sessionId: session.sessionId,
    user: await mapUserResponse(user, accountBalance),
    session: {
      id: session.sessionId,
      deviceInfo: session.deviceInfo,
      expiresAt: session.expiresAt,
    },
  };
}

module.exports = {
  registerUser,
  loginUser,
  mapUserResponse,
};
