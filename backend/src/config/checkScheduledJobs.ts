import { emailQueue } from "../services/emailQueue";
import pool from "./database";

async function checkScheduledJobs(): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT id, job_id, status, scheduled_at
      FROM scheduled_emails
      ORDER BY id DESC
    `);

    for (const row of result.rows) {
      const job = await emailQueue.getJob(row.job_id);

      console.log("\nDatabase record:");
      console.log(row);

      if (!job) {
        console.log("BullMQ job: NOT FOUND");
        continue;
      }

      console.log("BullMQ job found:");
      console.log({
        id: job.id,
        name: job.name,
        data: job.data,
        delay: job.delay,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason
      });

      console.log(
        "Job state:",
        await job.getState()
      );
    }
  } catch (error) {
    console.error("Check failed:", error);
  } finally {
    await emailQueue.close();
    await pool.end();
  }
}

checkScheduledJobs();