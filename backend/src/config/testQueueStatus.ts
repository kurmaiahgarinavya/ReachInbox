import { emailQueue } from "../services/emailQueue";

async function checkQueue(): Promise<void> {
  try {
    const failed = await emailQueue.getFailed();

    console.log("FAILED JOBS:", failed.length);

    console.log("\nFailed job details:");

    for (const job of failed) {
      console.log({
        id: job.id,
        name: job.name,
        data: job.data,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade
      });
    }
  } catch (error) {
    console.error("Queue check failed:", error);
  } finally {
    await emailQueue.close();
  }
}

checkQueue();