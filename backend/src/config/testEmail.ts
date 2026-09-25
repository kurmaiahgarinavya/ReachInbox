import { sendEmail } from "../services/emailService";

async function testEmail(): Promise<void> {
  try {
    const previewUrl = await sendEmail(
      1,
      "test@example.com",
      "ReachInbox Test Email",
      "This is a test email from ReachInbox."
    );

    console.log("Preview URL:", previewUrl);
  } catch (error) {
    console.error("Email test failed:", error);
  }
}

testEmail();