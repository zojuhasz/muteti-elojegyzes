import { Router, type IRouter } from "express";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";
import { db, patientsTable, surgeriesTable, surgeonsTable, operatingRoomsTable } from "@workspace/db";
import { z } from "zod";
import {
  GetDashboardStatsResponse,
  GetCalendarSurgeriesResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const CalendarQueryParams = z.object({
  from: z.string(),
  to: z.string(),
});

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalPatientsResult,
    waitingPatientsResult,
    scheduledTodayResult,
    completedThisMonthResult,
    totalSurgeriesResult,
    activeSurgeonsResult,
    activeRoomsResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(patientsTable),
    db.select({ count: count() }).from(patientsTable).where(eq(patientsTable.status, "waiting")),
    db.select({ count: count() }).from(surgeriesTable).where(
      and(
        gte(surgeriesTable.scheduledDate, dayStart),
        lte(surgeriesTable.scheduledDate, dayEnd),
        eq(surgeriesTable.status, "scheduled"),
      ),
    ),
    db.select({ count: count() }).from(surgeriesTable).where(
      and(
        gte(surgeriesTable.scheduledDate, monthStart),
        lte(surgeriesTable.scheduledDate, monthEnd),
        eq(surgeriesTable.status, "completed"),
      ),
    ),
    db.select({ count: count() }).from(surgeriesTable),
    db.select({ count: count() }).from(surgeonsTable).where(eq(surgeonsTable.isActive, true)),
    db.select({ count: count() }).from(operatingRoomsTable).where(eq(operatingRoomsTable.isActive, true)),
  ]);

  const stats = {
    totalPatients: totalPatientsResult[0].count,
    waitingPatients: waitingPatientsResult[0].count,
    scheduledToday: scheduledTodayResult[0].count,
    completedThisMonth: completedThisMonthResult[0].count,
    totalSurgeries: totalSurgeriesResult[0].count,
    activeSurgeons: activeSurgeonsResult[0].count,
    activeRooms: activeRoomsResult[0].count,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/calendar", async (req, res): Promise<void> => {
  const parsed = CalendarQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const from = new Date(parsed.data.from);
  from.setHours(0, 0, 0, 0);
  const to = new Date(parsed.data.to);
  to.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      surgery: surgeriesTable,
      patient: patientsTable,
      operatingRoom: operatingRoomsTable,
      surgeon: surgeonsTable,
    })
    .from(surgeriesTable)
    .leftJoin(patientsTable, eq(surgeriesTable.patientId, patientsTable.id))
    .leftJoin(operatingRoomsTable, eq(surgeriesTable.operatingRoomId, operatingRoomsTable.id))
    .leftJoin(surgeonsTable, eq(surgeriesTable.surgeonId, surgeonsTable.id))
    .where(and(gte(surgeriesTable.scheduledDate, from), lte(surgeriesTable.scheduledDate, to)))
    .orderBy(surgeriesTable.scheduledDate);

  const surgeries = rows.map((row) => ({
    ...row.surgery,
    patient: row.patient,
    operatingRoom: row.operatingRoom,
    surgeon: row.surgeon,
  }));

  res.json(GetCalendarSurgeriesResponse.parse(surgeries));
});

router.get("/dashboard/recent", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      surgery: surgeriesTable,
      patient: patientsTable,
      operatingRoom: operatingRoomsTable,
      surgeon: surgeonsTable,
    })
    .from(surgeriesTable)
    .leftJoin(patientsTable, eq(surgeriesTable.patientId, patientsTable.id))
    .leftJoin(operatingRoomsTable, eq(surgeriesTable.operatingRoomId, operatingRoomsTable.id))
    .leftJoin(surgeonsTable, eq(surgeriesTable.surgeonId, surgeonsTable.id))
    .orderBy(sql`${surgeriesTable.createdAt} DESC`)
    .limit(10);

  const surgeries = rows.map((row) => ({
    ...row.surgery,
    patient: row.patient,
    operatingRoom: row.operatingRoom,
    surgeon: row.surgeon,
  }));

  res.json(GetRecentActivityResponse.parse(surgeries));
});

export default router;
