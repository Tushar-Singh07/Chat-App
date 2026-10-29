import User from '../models/User.js';

// Helper to escape regex special characters to prevent invalid regex crashes
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/users/search?q=SEARCH_QUERY
export const searchUsers = async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();

    // STEP 8: Minimum query length 2 characters
    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: { users: [] },
      });
    }

    const escapedQuery = escapeRegex(query);
    const searchRegex = new RegExp(escapedQuery, 'i');

    // STEP 3 & STEP 5: Exclude currently authenticated user, case-insensitive partial match on name, email, phone
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    }).select('-password');

    // STEP 4: User Search Response format
    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users - Get all registered users except self
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile - Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, about, profilePicture, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (about !== undefined) user.about = about;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
