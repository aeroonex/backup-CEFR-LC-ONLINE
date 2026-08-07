import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 30;

function signAccessToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: ACCESS_TTL,
  });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: `${REFRESH_TTL_DAYS}d`,
  });
}

function setRefreshCookie(res: import("express").Response, token: string) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/auth/refresh",
  });
}

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Barcha maydonlar to'ldirilishi shart" });
  }

  const existing = await pool.query("select id from profiles where email = $1", [email]);
  if (existing.rowCount) {
    return res.status(409).json({ error: "Bu email allaqachon ro'yxatdan o'tgan" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `insert into profiles (username, email, password_hash, role, balance, total_spent)
     values ($1, $2, $3, 'student', 0, 0)
     returning id, username, email, role`,
    [username, email, passwordHash],
  );
  const user = result.rows[0];

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email va parolni kiriting" });
  }

  const result = await pool.query(
    "select id, username, email, role, password_hash from profiles where email = $1",
    [email],
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  res.json({
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    accessToken,
  });
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ error: "Refresh token topilmadi" });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const result = await pool.query("select id, role from profiles where id = $1", [payload.id]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Foydalanuvchi topilmadi" });

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "Refresh token yaroqsiz" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("refresh_token", { path: "/auth/refresh" });
  res.status(204).end();
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query(
    "select id, username, email, role, balance, total_spent from profiles where id = $1",
    [req.user!.id],
  );
  if (!result.rowCount) return res.status(404).json({ error: "Topilmadi" });
  res.json(result.rows[0]);
});

export default router;
