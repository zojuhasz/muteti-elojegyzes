import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, dailyRostersTable } from "@workspace/db";
import { eq, lte, sql } from "drizzle-orm";
import { GetDailyRosterResponse, UpsertDailyRosterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/daily-rosters/:date", async (req, res): Promise<void> => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Invalid date format, use YYYY-MM-DD" });
    return;
  }
  const [row] = await db.select().from(dailyRostersTable).where(eq(dailyRostersTable.date, date));
  if (row) {
    res.json(GetDailyRosterResponse.parse(row));
    return;
  }
  // No roster for this date — return the most recent prior roster as a template (without id/date)
  const [latest] = await db
    .select()
    .from(dailyRostersTable)
    .where(lte(dailyRostersTable.date, date))
    .orderBy(sql`${dailyRostersTable.date} DESC`)
    .limit(1);
  if (!latest) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  // Return a synthetic roster: same field values but no id/date so the client knows it's a fallback
  res.json(GetDailyRosterResponse.parse({ ...latest, id: 0, date }));
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
