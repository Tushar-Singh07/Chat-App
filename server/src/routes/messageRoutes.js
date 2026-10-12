import express from 'express';
import {
  getMessages,
  sendMessage,
  deleteMessage,
  reactToMessage,
} from '../controllers/messageController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/react', reactToMessage);

export default router;
