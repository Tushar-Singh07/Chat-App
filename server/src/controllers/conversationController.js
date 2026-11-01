import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { getIO } from '../socket/socketHandler.js';

// Get all conversations for current user
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: 'name email profilePicture' },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

// GET /api/conversations/:id - Get conversation by ID
export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id)
      .populate('participants', '-password')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// POST /api/conversations/direct & POST /api/conversations - Create or retrieve direct conversation
export const createConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.body.userId || req.body.targetUserId;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot create a direct conversation with yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    // STEP 12: Check if a direct conversation already exists between the two users (Prevent Duplicates!)
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, targetUserId], $size: 2 },
    })
      .populate('participants', '-password')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [currentUserId, targetUserId],
        isGroup: false,
      });

      conversation = await Conversation.findById(conversation._id).populate('participants', '-password');
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// Toggle Pin
export const togglePin = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isPinned = conversation.pinnedBy.includes(userId);
    if (isPinned) {
      conversation.pinnedBy = conversation.pinnedBy.filter((pid) => pid.toString() !== userId.toString());
    } else {
      conversation.pinnedBy.push(userId);
    }

    await conversation.save();
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// Toggle Mute
export const toggleMute = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isMuted = conversation.mutedBy.includes(userId);
    if (isMuted) {
      conversation.mutedBy = conversation.mutedBy.filter((mid) => mid.toString() !== userId.toString());
    } else {
      conversation.mutedBy.push(userId);
    }

    await conversation.save();
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// Toggle Archive
export const toggleArchive = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isArchived = conversation.archivedBy.includes(userId);
    if (isArchived) {
      conversation.archivedBy = conversation.archivedBy.filter((aid) => aid.toString() !== userId.toString());
    } else {
      conversation.archivedBy.push(userId);
    }

    await conversation.save();
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// Delete conversation
export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Conversation.findByIdAndDelete(id);
    await Message.deleteMany({ conversationId: id });

    res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Clear all messages in a conversation (Clear Chat)
export const clearConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to clear this chat' });
    }

    await Message.deleteMany({ conversationId: id });

    conversation.lastMessage = null;
    if (conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }
    await conversation.save();

    const io = getIO();
    if (io && conversation.participants) {
      for (const p of conversation.participants) {
        io.to(`user:${p.toString()}`).emit('chat_cleared', { conversationId: id.toString() });
      }
      io.to(id.toString()).emit('chat_cleared', { conversationId: id.toString() });
    }

    res.status(200).json({ success: true, message: 'Chat messages cleared successfully' });
  } catch (error) {
    next(error);
  }
};
