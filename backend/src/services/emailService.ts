import nodemailer from "nodemailer";
import pool from "../config/database";

export async function sendEmail(
  senderId: number,
  to: string,
  subject: string,
  text: string
): Promise<string | undefined> {
  const result = await pool.query(
    `SELECT
        email,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_password
     FROM senders
     WHERE id = $1`,
    [senderId]
  );

  if (result.rows.length === 0) {
    throw new Error("Sender not found");
  }

  const sender = result.rows[0];

  const transporter = nodemailer.createTransport({
    host: sender.smtp_host,
    port: sender.smtp_port,
    secure: false,
    auth: {
      user: sender.smtp_user,
      pass: sender.smtp_password
    }
  });

  const info = await transporter.sendMail({
    from: sender.email,
    to,
    subject,
    text
  });

  console.log("Email sent:", info.messageId);

  const previewUrl = nodemailer.getTestMessageUrl(info);

  return previewUrl || undefined;
}