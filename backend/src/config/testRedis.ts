import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379
});

async function testRedis(): Promise<void> {
  try {
    const result = await redis.ping();

    console.log("Redis connected successfully!");
    console.log("Redis response:", result);
  } catch (error) {
    console.error("Redis connection failed:", error);
  } finally {
    await redis.quit();
  }
}

testRedis();