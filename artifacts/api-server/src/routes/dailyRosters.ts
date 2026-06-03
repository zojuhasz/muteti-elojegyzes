import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, dailyRostersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetDailyRosterResponse, UpsertDailyRosterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/daily-rosters/:date", async (req, res): Promise<void> => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Invalid date format, use YYYY-MM-DD" });
    return;
  }
  const [row] = await db.select().from(dailyRostersTable).where(eq(dailyRostersTable.date, date));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetDailyRosterResponse.parse(row));
});

router.put("/daily-rosters/:date", async (req, res): Promise<void> => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Invalid date format, use YYYY-MM-DD" });
    return;
  }
  const parsed = UpsertDailyRosterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(dailyRostersTable)
    .values({ date, ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: dailyRostersTable.date,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();
  res.json(GetDailyRosterResponse.parse(row));
});

export default router;
