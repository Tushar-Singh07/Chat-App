import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// Temporary memory store for OTPs if user is registering for the first time
const pendingOTPStore = new Map(); // email -> { code, expires }

export const registerUser = async ({ name, email, phone, password }) => {
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 400;
    throw error;
  }

  if (phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      const error = new Error('User already exists with this phone number');
      error.statusCode = 400;
      throw error;
    }
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone: phone || undefined,
    password,
    isOnline: true,
    lastSeen: new Date(),
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  return user;
};

// Send Verification Code to Email
export const requestVerificationCode = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  let user = await User.findOne({ email: normalizedEmail }).select('+verificationCode +verificationCodeExpires');

  if (user) {
    user.verificationCode = code;
    user.verificationCodeExpires = expires;
    await user.save();
  } else {
    // Store pending OTP for new user
    pendingOTPStore.set(normalizedEmail, { code, expires });
  }

  // Send Email via Nodemailer & Log to Console
  await sendVerificationEmail(normalizedEmail, code);

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
    code, // Included so frontend can autofill or display in dev mode
  };
};

// Verify Code & Login/Register
export const loginWithVerificationCode = async (email, code) => {
  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail }).select('+verificationCode +verificationCodeExpires');

  let isValid = false;

  if (user && user.verificationCode && user.verificationCodeExpires) {
    if (user.verificationCode === code && user.verificationCodeExpires > new Date()) {
      isValid = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
    }
  } else if (pendingOTPStore.has(normalizedEmail)) {
    const pending = pendingOTPStore.get(normalizedEmail);
    if (pending.code === code && pending.expires > new Date()) {
      isValid = true;
      pendingOTPStore.delete(normalizedEmail);
    }
  }

  if (!isValid) {
    const error = new Error('Invalid or expired verification code');
    error.statusCode = 400;
    throw error;
  }

  // If user does not exist yet, automatically create account using email username
  if (!user) {
    const defaultName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    user = await User.create({
      name: formattedName,
      email: normalizedEmail,
      password: 'Password123!', // Default fallback password
      isOnline: true,
      lastSeen: new Date(),
    });
  } else {
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
  }

  return user;
};

export const logoutUser = async (userId) => {
  if (!userId) return;
  const user = await User.findById(userId);
  if (user) {
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();
  }
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};
