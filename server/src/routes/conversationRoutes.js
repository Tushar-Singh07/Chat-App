import express from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  togglePin,
  toggleMute,
  toggleArchive,
  deleteConversation,
} from '../controllers/conversationController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.post('/', createConversation);
router.post('/direct', createConversation);
router.patch('/:id/pin', togglePin);
router.patch('/:id/mute', toggleMute);
router.patch('/:id/archive', toggleArchive);
router.delete('/:id', deleteConversation);

export default router;
