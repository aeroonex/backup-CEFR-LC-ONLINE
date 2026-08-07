import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, ALLOWED_BUCKETS, type Bucket } from "../s3.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

router.post(
  "/:bucket",
  requireAuth,
  requireRole("developer", "teacher"),
  upload.single("file"),
  async (req, res) => {
    const bucket = req.params.bucket as Bucket;
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return res.status(400).json({ error: "Noma'lum bucket" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Fayl topilmadi" });
    }

    const key = `${randomUUID()}-${req.file.originalname}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }),
    );

    const publicUrl = `${process.env.S3_PUBLIC_URL}/${bucket}/${key}`;
    res.status(201).json({ key, url: publicUrl });
  },
);

export default router;
