import dotenv from "dotenv";
import { emailQueue } from "../services/emailQueue";

dotenv.config();

async function addTestJob(): Promise<void> {
  try {
    const job = await emailQueue.add("sendEmail", {
      to: process.env.SMTP_USER,
      subject: "BullMQ Test Email",
      text: "This email was sent through BullMQ and the ReachInbox email worker."
    });

    console.log("Test job added successfully!");
    console.log("Job ID:", job.id);
  } catch (error) {
    console.error("Failed to add test job:", error);
  } finally {
    await emailQueue.close();
  }
}

addTestJob();