import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Read the limit from env, default to 5 for production
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || "5", 10);

// Create a new ratelimiter
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(maxRequests, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
  timeout: 2000, // Fail after 2 seconds instead of 5
});

export function getClientIp(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1"; 
}