import { Router } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { pool } from "../db.js";
import { s3 } from "../s3.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:lessonVideoId/signed-url", requireAuth, async (req, res) => {
  const { lessonVideoId } = req.params;

  const video = await pool.query(
    `select lv.storage_key, lv.bucket, l.course_id
     from lesson_videos lv
     join lessons l on l.id = lv.lesson_id
     where lv.id = $1`,
    [lessonVideoId],
  );
  if (!video.rowCount) return res.status(404).json({ error: "Video topilmadi" });

  const { storage_key, bucket, course_id } = video.rows[0];

  const purchase = await pool.query(
    "select 1 from user_courses where user_id = $1 and course_id = $2",
    [req.user!.id, course_id],
  );
  if (!purchase.rowCount && req.user!.role === "student") {
    return res.status(403).json({ error: "Bu kursni sotib olmagansiz" });
  }

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: storage_key }),
    { expiresIn: 60 * 60 },
  );
  res.json({ url });
});

export default router;
