import { Router } from "express";
import { randomUUID } from "crypto";
import { emailQueue } from "../services/emailQueue";
import pool from "../config/database";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

/* =========================
   GET SENDERS
========================= */

router.get(
  "/senders",
  requireAuth,
  async (_req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          email
        FROM senders
        ORDER BY id ASC
        `
      );

      res.json(result.rows);
    } catch (error) {
      console.error(
        "Failed to get senders:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch senders"
      });
    }
  }
);

/* =========================
   SCHEDULE SINGLE EMAIL
========================= */

router.post(
  "/schedule",
  requireAuth,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const {
        to,
        subject,
        text,
        scheduledAt,
        senderId
      } = req.body;

      if (
        !to ||
        !subject ||
        !text ||
        !scheduledAt ||
        !senderId
      ) {
        return res.status(400).json({
          message:
            "to, subject, text, scheduledAt and senderId are required"
        });
      }

      const scheduledTime =
        new Date(scheduledAt).getTime();

      const delay =
        scheduledTime - Date.now();

      if (delay < 0) {
        return res.status(400).json({
          message:
            "Scheduled time must be in the future"
        });
      }

      const jobId = randomUUID();

      await client.query("BEGIN");

      const campaignResult =
        await client.query(
          `INSERT INTO campaigns
           (subject, body, status, user_id)
           VALUES ($1, $2, 'scheduled', $3)
           RETURNING id`,
          [
            subject,
            text,
            (req.user as any).id
          ]
        );

      const campaignId =
        campaignResult.rows[0].id;

      const recipientResult =
        await client.query(
          `INSERT INTO recipients
           (campaign_id, email)
           VALUES ($1, $2)
           RETURNING id`,
          [campaignId, to]
        );

      const recipientId =
        recipientResult.rows[0].id;

      await client.query(
        `INSERT INTO scheduled_emails
         (
           campaign_id,
           recipient_id,
           sender_id,
           scheduled_at,
           status,
           job_id
         )
         VALUES ($1, $2, $3, $4, 'scheduled', $5)`,
        [
          campaignId,
          recipientId,
          senderId,
          scheduledAt,
          jobId
        ]
      );

      await client.query("COMMIT");

      await emailQueue.add(
        "sendEmail",
        {
          to,
          subject,
          text,
          senderId,
          scheduledEmailId: jobId
        },
        {
          jobId,
          delay,
          attempts: 3,
          removeOnComplete: false,
          removeOnFail: false
        }
      );

      res.status(201).json({
        message:
          "Email scheduled successfully",
        jobId,
        scheduledAt
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Scheduling error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to schedule email"
      });
    } finally {
      client.release();
    }
  }
);

/* =========================
   SCHEDULE CAMPAIGN
========================= */

router.post(
  "/campaign",
  requireAuth,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const {
        subject,
        text,
        scheduledAt,
        senderId,
        recipients,
        delaySeconds,
        hourlyLimit
      } = req.body;

      if (
        !subject ||
        !text ||
        !scheduledAt ||
        !senderId ||
        !Array.isArray(recipients) ||
        recipients.length === 0
      ) {
        return res.status(400).json({
          message:
            "subject, text, scheduledAt, senderId and recipients are required"
        });
      }

      /*
       * Delay between emails.
       *
       * Example:
       * scheduledAt = 10:00
       * delaySeconds = 5
       *
       * Email 1 -> 10:00
       * Email 2 -> 10:00:05
       * Email 3 -> 10:00:10
       */

      const delayBetweenEmails =
        Number(delaySeconds) || 0;

      if (delayBetweenEmails < 0) {
        return res.status(400).json({
          message:
            "delaySeconds cannot be negative"
        });
      }

      const selectedTime =
        new Date(scheduledAt).getTime();

      if (
        Number.isNaN(selectedTime)
      ) {
        return res.status(400).json({
          message:
            "Invalid scheduledAt value"
        });
      }

      if (
        selectedTime <= Date.now()
      ) {
        return res.status(400).json({
          message:
            "Scheduled time must be in the future"
        });
      }

      /*
       * Hourly limit is accepted here because
       * the frontend sends it.
       *
       * We will connect it to the Redis
       * rate limiter in the next step.
       */
      const campaignHourlyLimit =
        Number(hourlyLimit) || 100;

      if (campaignHourlyLimit <= 0) {
        return res.status(400).json({
          message:
            "hourlyLimit must be greater than 0"
        });
      }

      await client.query("BEGIN");

      const campaignResult =
        await client.query(
          `INSERT INTO campaigns
           (subject, body, status, user_id)
           VALUES ($1, $2, 'scheduled', $3)
           RETURNING id`,
          [
            subject,
            text,
            (req.user as any).id
          ]
        );

      const campaignId =
        campaignResult.rows[0].id;

      const jobs: {
        jobId: string;
        recipientId: number;
        email: string;
        scheduledAt: Date;
      }[] = [];

      let validRecipientIndex = 0;

      for (const recipient of recipients) {
        if (
          !recipient ||
          !recipient.email
        ) {
          continue;
        }

        const recipientResult =
          await client.query(
            `INSERT INTO recipients
             (campaign_id, name, email)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [
              campaignId,
              recipient.name || null,
              recipient.email
            ]
          );

        const recipientId =
          recipientResult.rows[0].id;

        /*
         * Each recipient gets its own
         * scheduled time.
         */
        const recipientScheduledTime =
          new Date(
            selectedTime +
              validRecipientIndex *
                delayBetweenEmails *
                1000
          );

        const jobId = randomUUID();

        await client.query(
          `INSERT INTO scheduled_emails
           (
             campaign_id,
             recipient_id,
             sender_id,
             scheduled_at,
             status,
             job_id
           )
           VALUES
           ($1, $2, $3, $4, 'scheduled', $5)`,
          [
            campaignId,
            recipientId,
            senderId,
            recipientScheduledTime,
            jobId
          ]
        );

        jobs.push({
          jobId,
          recipientId,
          email: recipient.email,
          scheduledAt:
            recipientScheduledTime
        });

        validRecipientIndex++;
      }

      if (jobs.length === 0) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          message:
            "No valid recipients were provided"
        });
      }

      await client.query("COMMIT");

      /*
       * Create BullMQ jobs.
       *
       * Each job receives a different delay
       * based on the recipient's position.
       */
      for (const job of jobs) {
        const jobDelay =
          job.scheduledAt.getTime() -
          Date.now();

        await emailQueue.add(
          "sendEmail",
          {
            to: job.email,
            subject,
            text,
            senderId,
            scheduledEmailId:
              job.jobId,

            /*
             * Save these values in the
             * BullMQ job data so the worker
             * can use them later.
             */
            delaySeconds:
              delayBetweenEmails,

            hourlyLimit:
              campaignHourlyLimit
          },
          {
            jobId: job.jobId,

            /*
             * BullMQ delayed job.
             */
            delay: Math.max(
              0,
              jobDelay
            ),

            attempts: 3,

            removeOnComplete: false,
            removeOnFail: false
          }
        );
      }

      res.status(201).json({
        message:
          "Campaign scheduled successfully",

        campaignId,

        recipients:
          jobs.length,

        scheduledAt,

        delaySeconds:
          delayBetweenEmails,

        hourlyLimit:
          campaignHourlyLimit
      });
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "Campaign scheduling error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to schedule campaign"
      });
    } finally {
      client.release();
    }
  }
);

/* =========================
   GET SCHEDULED EMAILS
========================= */

router.get(
  "/scheduled",
  requireAuth,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            se.id,
            se.scheduled_at,
            se.status,
            se.job_id,
            c.subject,
            c.body,
            r.name AS recipient_name,
            r.email AS recipient_email,
            s.name AS sender_name,
            s.email AS sender_email
          FROM scheduled_emails se
          JOIN campaigns c
            ON se.campaign_id = c.id
          JOIN recipients r
            ON se.recipient_id = r.id
          LEFT JOIN senders s
            ON se.sender_id = s.id
          WHERE c.user_id = $1
            AND se.status IN (
              'scheduled',
              'processing'
            )
          ORDER BY
            se.scheduled_at ASC
          `,
          [
            (req.user as any).id
          ]
        );

      res.json(result.rows);
    } catch (error) {
      console.error(
        "Failed to get scheduled emails:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch scheduled emails"
      });
    }
  }
);

/* =========================
   GET SENT EMAILS
========================= */

router.get(
  "/sent",
  requireAuth,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            se.id,
            se.sent_at,
            se.status,
            c.subject,
            c.body,
            r.name AS recipient_name,
            r.email AS recipient_email,
            s.name AS sender_name,
            s.email AS sender_email
          FROM scheduled_emails se
          JOIN campaigns c
            ON se.campaign_id = c.id
          JOIN recipients r
            ON se.recipient_id = r.id
          LEFT JOIN senders s
            ON se.sender_id = s.id
          WHERE c.user_id = $1
            AND se.status IN (
              'sent',
              'failed'
            )
          ORDER BY
            se.sent_at DESC NULLS LAST
          `,
          [
            (req.user as any).id
          ]
        );

      res.json(result.rows);
    } catch (error) {
      console.error(
        "Failed to get sent emails:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch sent emails"
      });
    }
  }
);

export default router;