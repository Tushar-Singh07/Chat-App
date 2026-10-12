import express from 'express';
import { searchUsers, getAllUsers, updateProfile } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.put('/profile', updateProfile);

export default router;
