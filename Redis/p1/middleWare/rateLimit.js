import { redis } from "../index.js";

const rateLimitter = async (req, res, next) => {
  const { ip } = req;
  const key = `rateLimit${ip}`;
  console.log(key, "KEY");
  const countRequets = await redis.incr(key);
  console.log(countRequets, "countRequets");

  if (countRequets === 1) {
    await redis.expire(key, 60);
  }

  const ttl = await redis.ttl(key);
  console.log(ttl, "TTL");

  if (countRequets > 5) {
    return res
      .status(429)
      .json({ message: "Too Many Requests", retryAfter: ttl + " seconds" });
  }
  next();
};

export default rateLimitter;
