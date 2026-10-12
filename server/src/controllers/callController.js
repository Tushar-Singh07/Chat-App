import Call from '../models/Call.js';

// Get call history for user
export const getCalls = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .populate('callerId', 'name email profilePicture phone')
      .populate('receiverId', 'name email profilePicture phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: calls });
  } catch (error) {
    next(error);
  }
};

// Log call record
export const createCallRecord = async (req, res, next) => {
  try {
    const callerId = req.user._id;
    const { receiverId, type, status, duration } = req.body;

    if (!receiverId || !type || !status) {
      return res.status(400).json({ success: false, message: 'Missing required call fields' });
    }

    const newCall = await Call.create({
      callerId,
      receiverId,
      type,
      status,
      duration: duration || '00:00',
    });

    const populatedCall = await Call.findById(newCall._id)
      .populate('callerId', 'name email profilePicture phone')
      .populate('receiverId', 'name email profilePicture phone');

    res.status(201).json({ success: true, data: populatedCall });
  } catch (error) {
    next(error);
  }
};
