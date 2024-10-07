const { GraphQLError } = require("graphql");

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 2 * 60 * 1000;
const MAX_FAILED_REQUESTS = 20;
const ipRateLimits = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const rateLimit = ipRateLimits.get(ip) || { count: 0, timestamp: now };

  if (now - rateLimit.timestamp >= RATE_LIMIT_WINDOW) {
    rateLimit.count = 0;
    rateLimit.timestamp = now;
  }

  if (rateLimit.count >= MAX_FAILED_REQUESTS) {
    throw new GraphQLError("Rate limit exceeded. Please try again later.");
  }

  rateLimit.count++;
  ipRateLimits.set(ip, rateLimit);
}

module.exports = { checkRateLimit };
