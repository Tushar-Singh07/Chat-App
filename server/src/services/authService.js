import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// Temporary memory store for OTPs if user is registering for the first time
const pendingOTPStore = new Map(); // email -> { code, expires }

export const registerUser = async ({ name, email, phone, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 400;
    throw error;
  }

  if (phone) {
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      const error = new Error('User already exists with this phone number');
      error.statusCode = 400;
      throw error;
    }
  }

  // Generate 6-digit verification code for new user
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : undefined,
    password,
    isOnline: false,
    lastSeen: new Date(),
    isVerified: false,
    verificationCode: code,
    verificationCodeExpires: expires,
  });

  // Automatically dispatch verification email to the newly registered user
  try {
    await sendVerificationEmail(normalizedEmail, code);
  } catch (emailErr) {
    console.error(`Failed to dispatch verification email to ${normalizedEmail}:`, emailErr);
  }

  return user;
};

export const validateUserCredentials = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

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

  return user;
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password +verificationCode +verificationCodeExpires');

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

  // If a new user registered but has not yet verified their email code
  if (user.isVerified === false) {
    // Generate fresh code and email it so they can easily complete verification
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(normalizedEmail, code);
    } catch (e) {
      console.error(`Failed to send verification email to ${normalizedEmail}:`, e);
    }

    const error = new Error('Please verify your email address to complete registration');
    error.statusCode = 403;
    error.requiresVerification = true;
    error.email = normalizedEmail;
    throw error;
  }

  // Ensure verified status is persisted
  if (user.isVerified === undefined) {
    user.isVerified = true;
  }

  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  return user;
};

// Send Verification Code to Email (e.g., when resending)
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

  // Send Email via Nodemailer strictly to the given recipient email
  await sendVerificationEmail(normalizedEmail, code);

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
  };
};

// Verify Code & Login
export const loginWithVerificationCode = async (email, code) => {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanCode = (code || '').trim();
  let user = await User.findOne({ email: normalizedEmail }).select('+verificationCode +verificationCodeExpires');

  let isValid = false;

  if (user && user.verificationCode && user.verificationCodeExpires) {
    if (user.verificationCode === cleanCode && user.verificationCodeExpires > new Date()) {
      isValid = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      user.isVerified = true;
    }
  } else if (pendingOTPStore.has(normalizedEmail)) {
    const pending = pendingOTPStore.get(normalizedEmail);
    if (pending.code === cleanCode && pending.expires > new Date()) {
      isValid = true;
      pendingOTPStore.delete(normalizedEmail);
    }
  }

  if (!isValid) {
    const error = new Error('Invalid or expired verification code');
    error.statusCode = 400;
    throw error;
  }

  // If user does not exist yet, create verified account
  if (!user) {
    const defaultName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    user = await User.create({
      name: formattedName,
      email: normalizedEmail,
      password: 'Password123!',
      isVerified: true,
      isOnline: true,
      lastSeen: new Date(),
    });
  } else {
    user.isVerified = true;
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
