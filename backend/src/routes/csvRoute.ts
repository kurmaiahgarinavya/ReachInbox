import { Router } from "express";
import multer from "multer";
import fs from "fs";
import pool from "../config/database";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

const upload = multer({
  dest: "uploads/"
});

router.post(
  "/upload/:campaignId",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      const campaignId = Number(req.params.campaignId);

      if (!req.file) {
        return res.status(400).json({
          message: "CSV file is required"
        });
      }

      if (!campaignId) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          message: "Valid campaignId is required"
        });
      }

      const campaignResult = await pool.query(
        `SELECT id
         FROM campaigns
         WHERE id = $1
           AND user_id = $2`,
        [campaignId, (req.user as any).id]
      );

      if (campaignResult.rows.length === 0) {
        fs.unlinkSync(req.file.path);

        return res.status(403).json({
          message: "You do not have access to this campaign"
        });
      }

      const fileContent = fs.readFileSync(
        req.file.path,
        "utf-8"
      );

      const lines = fileContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length < 2) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          message:
            "CSV must contain a header and at least one recipient"
        });
      }

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim().toLowerCase());

      const emailIndex = headers.indexOf("email");
      const nameIndex = headers.indexOf("name");

      if (emailIndex === -1) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          message: "CSV must contain an email column"
        });
      }

      let insertedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i]
          .split(",")
          .map((value) => value.trim());

        const email = columns[emailIndex];

        const name =
          nameIndex !== -1
            ? columns[nameIndex] || null
            : null;

        if (!email) {
          continue;
        }

        await pool.query(
          `INSERT INTO recipients
           (campaign_id, name, email)
           VALUES ($1, $2, $3)`,
          [campaignId, name, email]
        );

        insertedCount++;
      }

      fs.unlinkSync(req.file.path);

      res.status(201).json({
        message: "CSV uploaded successfully",
        recipientsAdded: insertedCount
      });
    } catch (error) {
      console.error("CSV upload error:", error);

      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // File already removed
        }
      }

      res.status(500).json({
        message: "Failed to process CSV"
      });
    }
  }
);

export default router;