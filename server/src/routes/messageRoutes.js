import express from 'express';
import {
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  toggleStarMessage,
  togglePinMessage,
  reactToMessage,
  markConversationAsRead,
} from '../controllers/messageController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.put('/read/:conversationId', markConversationAsRead);
router.put('/:id', editMessage);
router.patch('/:id', editMessage);
router.patch('/:id/star', toggleStarMessage);
router.patch('/:id/pin', togglePinMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/react', reactToMessage);

export default router;
