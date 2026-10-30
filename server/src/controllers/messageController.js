import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { isUserOnline, isUserInConversation, getIO } from '../socket/socketHandler.js';

// Get messages for a conversation
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('senderId', '-password')
      .populate('replyTo')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// Send message
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { conversationId, content, replyToMessageId, attachments, callSummary } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Determine receiver in direct conversation
    const receiverId = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );

    // Rule 1, 2, 3:
    // If receiver is actively in this conversation room -> 'read' (instant double blue tick)
    // If receiver is online -> 'delivered' (double tick)
    // If receiver is offline -> 'sent' (one tick)
    const isReceiverViewingChat = receiverId ? isUserInConversation(conversationId, receiverId) : false;
    const isReceiverOnline = receiverId ? isUserOnline(receiverId) : false;

    const initialStatus = isReceiverViewingChat
      ? 'read'
      : isReceiverOnline
      ? 'delivered'
      : 'sent';

    const newMessage = await Message.create({
      conversationId,
      senderId,
      content: content || '',
      attachments: attachments || [],
      replyTo: replyToMessageId || undefined,
      callSummary: callSummary || undefined,
      status: initialStatus,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', '-password')
      .populate('replyTo');

    // Update conversation lastMessage & increment receiver unread count if receiver is not currently viewing
    conversation.lastMessage = populatedMessage._id;
    if (receiverId) {
      const recIdStr = receiverId.toString();
      if (!conversation.unreadCounts) {
        conversation.unreadCounts = new Map();
      }
      if (!isReceiverViewingChat) {
        const currentUnread = (conversation.unreadCounts.get(recIdStr) || 0) + 1;
        conversation.unreadCounts.set(recIdStr, currentUnread);
      } else {
        conversation.unreadCounts.set(recIdStr, 0);
      }
    }
    await conversation.save();

    // Broadcast in real-time to receiver if online
    const io = getIO();
    if (io && receiverId) {
      io.to(`user:${receiverId}`).emit('receive_message', populatedMessage);
      io.to(conversationId.toString()).emit('receive_message', populatedMessage);
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    next(error);
  }
};

// Mark conversation messages as read (Rule 3: Blue Ticks)
export const markConversationAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Update all unread messages sent by others in this conversation to 'read'
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        status: { $in: ['sent', 'delivered'] },
      },
      { status: 'read' }
    );

    // Reset unread count for current user
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    // Notify other participants (senders) in real time so their checkmarks turn blue
    const io = getIO();
    if (io) {
      const readPayload = {
        conversationId: conversationId.toString(),
        readerId: userId.toString(),
        status: 'read',
      };

      for (const p of conversation.participants) {
        const pId = p.toString();
        if (pId !== userId.toString()) {
          io.to(`user:${pId}`).emit('messages_read', readPayload);
        }
      }
      io.to(conversationId.toString()).emit('messages_read', readPayload);
    }

    res.status(200).json({ success: true, message: 'Conversation messages marked as read' });
  } catch (error) {
    next(error);
  }
};

// Delete message
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

// React to message
export const reactToMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        // Remove reaction
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update reaction
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Add reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const populatedMessage = await Message.findById(id)
      .populate('senderId', '-password')
      .populate('replyTo');

    res.status(200).json({ success: true, data: populatedMessage });
  } catch (error) {
    next(error);
  }
};
