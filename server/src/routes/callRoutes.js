import express from 'express';
import { getCalls, createCallRecord } from '../controllers/callController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getCalls);
router.post('/', createCallRecord);

export default router;
