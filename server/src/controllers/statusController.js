import Status from '../models/Status.js';

// Get active statuses
export const getStatuses = async (req, res, next) => {
  try {
    const statuses = await Status.find({ expiresAt: { $gt: new Date() } })
      .populate('userId', 'name email profilePicture phone about')
      .populate('viewers', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: statuses });
  } catch (error) {
    next(error);
  }
};

// Create new status
export const createStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, content, bgColor, caption } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Status content is required' });
    }

    const newStatus = await Status.create({
      userId,
      type: type || 'text',
      content,
      bgColor: bgColor || 'from-emerald-600 to-teal-800',
      caption: caption || '',
    });

    const populatedStatus = await Status.findById(newStatus._id).populate(
      'userId',
      'name email profilePicture phone about'
    );

    res.status(201).json({ success: true, data: populatedStatus });
  } catch (error) {
    next(error);
  }
};

// Mark status as viewed
export const viewStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const status = await Status.findById(id);
    if (!status) return res.status(404).json({ success: false, message: 'Status not found' });

    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);
      await status.save();
    }

    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};
