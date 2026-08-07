import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await pool.query("select * from courses order by created_at desc");
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const result = await pool.query("select * from courses where id = $1", [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: "Kurs topilmadi" });
  res.json(result.rows[0]);
});

router.get("/:id/parts", async (req, res) => {
  const result = await pool.query(
    "select * from course_parts where course_id = $1 order by position asc",
    [req.params.id],
  );
  res.json(result.rows);
});

router.post("/", requireAuth, requireRole("developer", "teacher"), async (req, res) => {
  const { title, description, price, category } = req.body ?? {};
  const result = await pool.query(
    `insert into courses (title, description, price, category)
     values ($1, $2, $3, $4) returning *`,
    [title, description, price, category],
  );
  res.status(201).json(result.rows[0]);
});

export default router;
