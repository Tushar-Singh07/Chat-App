import express from 'express';
import {
  register,
  login,
  validateCredentials,
  sendCode,
  verifyCode,
  logout,
  getMe,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
} from '../validators/authValidator.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/validate-credentials', validateLogin, validateCredentials);
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getMe);

export default router;
