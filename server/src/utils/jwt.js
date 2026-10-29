import jwt from 'jsonwebtoken';

export const generateToken = (res, userId) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET || 'fallback_development_jwt_secret_only';

  const token = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  if (res) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return token;
};

export const verifyToken = (token) => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback_development_jwt_secret_only';
  return jwt.verify(token, jwtSecret);
};
