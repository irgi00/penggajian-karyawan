export const COOKIE_NAME = "session_token";
export const COOKIE_MAX_AGE = 86400; // 24 hours in seconds
export const JWT_EXPIRES = "24h";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return secret;
};
