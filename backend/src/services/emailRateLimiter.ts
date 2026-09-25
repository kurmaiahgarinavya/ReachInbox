import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
});

const MIN_DELAY = Number(
  process.env.MIN_DELAY_BETWEEN_EMAILS_MS
) || 1000;

export async function waitForSendSlot(): Promise<void> {
  while (true) {
    const result = await redis.set(
      "email:send:lock",
      "1",
      "PX",
      MIN_DELAY,
      "NX"
    );

    if (result === "OK") {
      return;
    }

    const ttl = await redis.pttl("email:send:lock");

    if (ttl > 0) {
      await new Promise((resolve) => {
        setTimeout(resolve, ttl);
      });
    } else {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }
  }
}