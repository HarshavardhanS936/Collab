import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Specific Rate limiting middleware for AI routes
export const aiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each user to 10 requests per 5 minutes
  keyGenerator: (req, res) => {
    // Key by user _id if available, otherwise fall back to IP address (using the helper to avoid IPv6 validation error)
    return req.user ? req.user._id.toString() : ipKeyGenerator(req, res);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many AI requests, please wait a few minutes and try again."
    });
  }
});
