import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

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

    const newMessage = await Message.create({
      conversationId,
      senderId,
      content: content || '',
      attachments: attachments || [],
      replyTo: replyToMessageId || undefined,
      callSummary: callSummary || undefined,
      status: 'sent',
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', '-password')
      .populate('replyTo');

    // Update conversation lastMessage & updatedAt
    conversation.lastMessage = populatedMessage._id;
    await conversation.save();

    res.status(201).json({ success: true, data: populatedMessage });
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
