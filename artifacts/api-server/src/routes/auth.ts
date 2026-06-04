import { Router } from "express";
import { z } from "zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyDrupalPassword } from "../lib/drupalPassword";

const router = Router();

const SHARED_PASSWORD = process.env["SHARED_PASSWORD"] ?? "Samutal981";

const loginSchema = z.object({
  username: z.string().min(1, "Felhasználónév kötelező"),
  password: z.string().min(1, "Jelszó kötelező"),
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Hiányzó adatok" });
    return;
  }

  const { username, password } = parsed.data;

  // Per-user Drupal jelszó ellenőrzés
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username.trim()))
    .limit(1);

  if (user) {
    if (!user.isActive) {
      res.status(401).json({ error: "A felhasználó inaktív" });
      return;
    }
    if (!verifyDrupalPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "Hibás jelszó" });
      return;
    }
  } else {
    // Fallback: közös jelszó (ha nincs users táblában)
    if (password !== SHARED_PASSWORD) {
      res.status(401).json({ error: "Hibás felhasználónév vagy jelszó" });
      return;
    }
  }

  req.session.username = username.trim();
  res.json({ username: req.session.username });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.session.username) {
    res.status(401).json({ error: "Nincs bejelentkezve" });
    return;
  }
  res.json({ username: req.session.username });
});

export default router;
