const redis = require("redis");
require("dotenv").config();

// Validate Redis environment variables
if (
  !process.env.REDIS_HOST ||
  !process.env.REDIS_PORT ||
  !process.env.REDIS_PASSWORD
) {
  console.warn(
    "⚠️  Redis credentials not fully configured. Cache will be disabled.",
  );
  console.log("   Set REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env file");
}

console.log("\n📍 Redis Configuration:");
console.log("   HOST:", process.env.REDIS_HOST || "NOT SET");
console.log("   PORT:", process.env.REDIS_PORT || "NOT SET");
console.log("   PASSWORD:", process.env.REDIS_PASSWORD ? "***" : "NOT SET");
console.log("   DB:", process.env.REDIS_DB || "0");
console.log("");

// Build Redis URL for connection
const redisUrl = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB || 0}`;

const client = redis.createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000,
    keepAlive: 30000,
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log(
          "⚠️  Redis: Max reconnection attempts reached. Running without cache.",
        );
        return new Error("Redis max reconnect attempts");
      }
      const delay = Math.min(retries * 100, 3000);
      console.log(
        `⏳ Redis: Retrying connection (attempt ${retries + 1}/5)...`,
      );
      return delay;
    },
  },
});

let isRedisConnected = false;

// Handle connection events
client.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
  isRedisConnected = false;
});

client.on("connect", () => {
  console.log("✅ Redis: Connected");
  isRedisConnected = true;
});

client.on("ready", () => {
  console.log("✅ Redis: Ready for commands");
  isRedisConnected = true;
});

client.on("reconnecting", () => {
  console.log("⏳ Redis: Reconnecting...");
  isRedisConnected = false;
});

client.on("end", () => {
  console.log("⚠️  Redis: Connection closed");
  isRedisConnected = false;
});

// Connect the client
(async () => {
  try {
    await client.connect();
    isRedisConnected = true;
    console.log("✅ Redis: Connection established\n");
  } catch (err) {
    console.error("❌ Redis: Connection failed");
    console.error("   Error:", err.message);
    console.error(
      "   ℹ️  App will continue without cache. Verify Redis credentials in .env\n",
    );
    isRedisConnected = false;
  }
})();

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL) || 600; // 10 minutes

/**
 * Generate a cache key from query parameters
 */
const generateCacheKey = (prefix, obj = {}) => {
  const sortedParams = Object.keys(obj)
    .sort()
    .map((key) => `${key}=${obj[key]}`)
    .join("&");
  return sortedParams ? `${prefix}:${sortedParams}` : prefix;
};

/**
 * Get cached data - gracefully handles Redis unavailability
 */
const getCache = async (key) => {
  if (!isRedisConnected) {
    console.log(`[CACHE DISABLED] ${key}`);
    return null;
  }

  try {
    const data = await client.get(key);
    if (data) {
      console.log(`✅ [CACHE HIT] ${key}`);
      return JSON.parse(data);
    }
    console.log(`⚠️  [CACHE MISS] ${key}`);
    return null;
  } catch (error) {
    console.error("❌ Cache get error:", error.message);
    return null;
  }
};

/**
 * Set cached data with TTL - gracefully handles Redis unavailability
 */
const setCache = async (key, data, ttl = DEFAULT_TTL) => {
  if (!isRedisConnected) {
    console.log(`[CACHE DISABLED] Cannot set: ${key}`);
    return false;
  }

  try {
    await client.setEx(key, ttl, JSON.stringify(data));
    console.log(`📝 [CACHE SET] ${key} | TTL: ${ttl}s`);
    return true;
  } catch (error) {
    console.error("❌ Cache set error:", error.message);
    return false;
  }
};

/**
 * Delete cached data
 */
const deleteCache = async (key) => {
  if (!isRedisConnected) {
    console.log(`[CACHE DISABLED] Cannot delete: ${key}`);
    return false;
  }

  try {
    await client.del(key);
    console.log(`🗑️  [CACHE DELETED] ${key}`);
    return true;
  } catch (error) {
    console.error("❌ Cache delete error:", error.message);
    return false;
  }
};

/**
 * Clear all caches matching a pattern
 */
const clearCachePattern = async (pattern) => {
  if (!isRedisConnected) {
    console.log(`[CACHE DISABLED] Cannot clear pattern: ${pattern}`);
    return false;
  }

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(
        `🗑️  [CACHE INVALIDATED] Cleared ${keys.length} keys matching "${pattern}"`,
      );
    } else {
      console.log(`ℹ️  [CACHE CLEAR] No keys found matching "${pattern}"`);
    }
    return true;
  } catch (error) {
    console.error("❌ Cache clear error:", error.message);
    return false;
  }
};

module.exports = {
  client,
  isRedisConnected: () => isRedisConnected,
  generateCacheKey,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
};
