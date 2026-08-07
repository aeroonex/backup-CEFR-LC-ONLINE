import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("developer"));

router.get("/users", async (_req, res) => {
  const result = await pool.query(`
    select p.id, p.username, p.email, p.created_at, p.role, p.balance, p.total_spent,
           count(uc.id) as purchased_courses_count
    from profiles p
    left join user_courses uc on uc.user_id = p.id
    group by p.id
    order by p.created_at desc
  `);
  res.json(result.rows);
});

router.delete("/users/:id", async (req, res) => {
  await pool.query("delete from profiles where id = $1", [req.params.id]);
  res.status(204).end();
});

export default router;
