import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    attachments: [
      {
        url: String,
        type: { type: String }, // image, video, audio, document
        name: String,
        size: String,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
      },
    ],
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    starredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    callSummary: {
      type: new mongoose.Schema(
        {
          type: { type: String }, // 'voice' | 'video'
          duration: String,
          status: { type: String }, // 'started' | 'ended' | 'missed' | 'rejected'
          callId: { type: String },
        },
        { _id: false }
      ),
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index(
  { conversationId: 1, 'callSummary.callId': 1, 'callSummary.status': 1 },
  { sparse: true }
);

messageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  // Ensure non-call messages never serialize a partial callSummary object
  if (obj.callSummary && !obj.callSummary.type) {
    delete obj.callSummary;
  }
  return obj;
};

const Message = mongoose.model('Message', messageSchema);
export default Message;
