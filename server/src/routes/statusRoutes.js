import express from 'express';
import { getStatuses, createStatus, viewStatus } from '../controllers/statusController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getStatuses);
router.post('/', createStatus);
router.post('/:id/view', viewStatus);

export default router;
