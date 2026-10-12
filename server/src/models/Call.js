import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['voice', 'video'],
      required: true,
    },
    status: {
      type: String,
      enum: ['incoming', 'outgoing', 'missed', 'ended', 'rejected', 'cancelled', 'busy', 'completed'],
      required: true,
    },
    duration: {
      type: String,
      default: '00:00',
    },
  },
  {
    timestamps: true,
  }
);

callSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

const Call = mongoose.model('Call', callSchema);
export default Call;
