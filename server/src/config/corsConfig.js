export const getAllowedOrigins = () => {
  const clientUrlEnv = process.env.CLIENT_URL;
  if (!clientUrlEnv) return [];
  return clientUrlEnv
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

export const corsOriginValidator = (origin, callback) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health check probes)
  if (!origin) return callback(null, true);

  const allowedOrigins = getAllowedOrigins();

  // If running in development or CLIENT_URL is not yet configured, allow all origins
  if (process.env.NODE_ENV !== 'production' || allowedOrigins.length === 0) {
    return callback(null, true);
  }

  const normalizedOrigin = origin.replace(/\/+$/, '');

  // Check exact matches or wildcard
  const isMatch =
    allowedOrigins.includes(normalizedOrigin) ||
    allowedOrigins.includes('*') ||
    // Support Vercel deployment and preview URLs if vercel.app is configured in CLIENT_URL
    (normalizedOrigin.endsWith('.vercel.app') && allowedOrigins.some((u) => u.includes('vercel.app')));

  if (isMatch) {
    return callback(null, true);
  }

  console.warn(`[CORS Blocked] Origin "${origin}" rejected. Allowed origins: ${allowedOrigins.join(', ')}`);
  return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
};
