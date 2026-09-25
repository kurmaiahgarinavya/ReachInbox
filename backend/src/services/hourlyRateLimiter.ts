import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
});

const HOURLY_LIMIT =
  Number(process.env.HOURLY_EMAIL_LIMIT) || 50;

export async function waitForHourlyLimit(): Promise<void> {
  while (true) {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const result = await redis.eval(
      `
      redis.call(
        "ZREMRANGEBYSCORE",
        KEYS[1],
        0,
        ARGV[1]
      )

      local count = redis.call(
        "ZCARD",
        KEYS[1]
      )

      if count < tonumber(ARGV[2]) then
        redis.call(
          "ZADD",
          KEYS[1],
          ARGV[3],
          ARGV[4]
        )

        return 1
      end

      return 0
      `,
      1,
      "email:hourly:sends",
      oneHourAgo,
      HOURLY_LIMIT,
      now,
      `${now}-${Math.random()}`
    );

    if (result === 1) {
      return;
    }

    console.log("Hourly email limit reached. Waiting...");

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
}