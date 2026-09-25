import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { sendEmail } from "../services/emailService";
import pool from "../config/database";
import { waitForSendSlot } from "../services/emailRateLimiter";
import { waitForHourlyLimit } from "../services/hourlyRateLimiter";

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
});

const emailWorker = new Worker(
  "emailQueue",
  async (job: Job) => {
    console.log("Processing email job:", job.id);

    const {
  to,
  subject,
  text,
  scheduledEmailId,
  senderId
} = job.data;

    try {
      // Claim the email before sending.
      // Only a scheduled email can be processed.
      const claimResult = await pool.query(
        `UPDATE scheduled_emails
         SET status = 'processing'
         WHERE job_id = $1
           AND status = 'scheduled'
         RETURNING id`,
        [scheduledEmailId]
      );

      // If no row was updated, this email was already processed
      // or another worker is already processing it.
      if (claimResult.rowCount === 0) {
        console.log("Email already processed or being processed.");
        console.log("Skipping duplicate send for job:", job.id);

        return {
          success: true,
          skipped: true
        };
      }

      console.log("Email claimed successfully.");
      await waitForHourlyLimit();
      await waitForSendSlot();

      // Send the email
      const previewUrl = await sendEmail(
  senderId,
  to,
  subject,
  text
);

      // Mark email as sent
      const result = await pool.query(
        `UPDATE scheduled_emails
         SET status = 'sent',
             sent_at = CURRENT_TIMESTAMP
         WHERE job_id = $1
           AND status = 'processing'`,
        [scheduledEmailId]
      );

      console.log("Database rows updated:", result.rowCount);

      console.log("Email sent successfully!");
      console.log("Preview URL:", previewUrl);

      return {
        success: true,
        previewUrl
      };
    } catch (error) {
      // Mark the email as failed
      await pool.query(
        `UPDATE scheduled_emails
         SET status = 'failed',
             error_message = $1
         WHERE job_id = $2`,
        [
          error instanceof Error ? error.message : "Unknown error",
          scheduledEmailId
        ]
      );

      throw error;
    }
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 1
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Email worker started...");