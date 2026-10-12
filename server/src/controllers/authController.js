import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  requestVerificationCode,
  loginWithVerificationCode,
} from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await registerUser({ name, email, phone, password });
    const token = generateToken(res, user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });
    const token = generateToken(res, user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500);
    next(error);
  }
};

export const sendCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const result = await requestVerificationCode(email);
    res.status(200).json({
      success: true,
      message: result.message,
      code: result.code,
      data: {
        code: result.code,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500);
    next(error);
  }
};

export const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email address and verification code are required' });
    }

    const user = await loginWithVerificationCode(email, code);
    const token = generateToken(res, user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified and logged in successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logoutUser(req.user._id);
    }

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user._id);
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
