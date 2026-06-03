import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db, surgeriesTable, patientsTable, operatingRoomsTable, surgeonsTable } from "@workspace/db";
import {
  ListSurgeriesResponse,
  CreateSurgeryBody,
  GetSurgeryParams,
  GetSurgeryResponse,
  UpdateSurgeryParams,
  UpdateSurgeryBody,
  UpdateSurgeryResponse,
  DeleteSurgeryParams,
} from "@workspace/api-zod";

const ListSurgeriesQuery = z.object({
  date: z.string().optional(),
  operatingRoomId: z.coerce.number().optional(),
  surgeonId: z.coerce.number().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  patientId: z.coerce.number().optional(),
});

const router: IRouter = Router();

async function getSurgeryWithRelations(id: number) {
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
    .where(eq(surgeriesTable.id, id));

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    ...row.surgery,
    patient: row.patient,
    operatingRoom: row.operatingRoom,
    surgeon: row.surgeon,
  };
}

router.get("/surgeries", async (req, res): Promise<void> => {
  const parsed = ListSurgeriesQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, operatingRoomId, surgeonId, status, patientId } = parsed.data;

  const conditions = [];
  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    conditions.push(gte(surgeriesTable.scheduledDate, dayStart));
    conditions.push(lte(surgeriesTable.scheduledDate, dayEnd));
  }
  if (operatingRoomId) {
    conditions.push(eq(surgeriesTable.operatingRoomId, operatingRoomId));
  }
  if (surgeonId) {
    conditions.push(eq(surgeriesTable.surgeonId, surgeonId));
  }
  if (status) {
    conditions.push(eq(surgeriesTable.status, status));
  }
  if (patientId) {
    conditions.push(eq(surgeriesTable.patientId, patientId));
  }

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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(surgeriesTable.scheduledDate);

  const surgeries = rows.map((row) => ({
    ...row.surgery,
    patient: row.patient,
    operatingRoom: row.operatingRoom,
    surgeon: row.surgeon,
  }));

  res.json(ListSurgeriesResponse.parse(surgeries));
});

router.post("/surgeries", async (req, res): Promise<void> => {
  const parsed = CreateSurgeryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inserted] = await db.insert(surgeriesTable).values({
    ...parsed.data,
    scheduledDate: new Date(parsed.data.scheduledDate),
    status: parsed.data.status ?? "scheduled",
  }).returning();

  const surgery = await getSurgeryWithRelations(inserted.id);
  res.status(201).json(GetSurgeryResponse.parse(surgery));
});

router.get("/surgeries/:id", async (req, res): Promise<void> => {
  const params = GetSurgeryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const surgery = await getSurgeryWithRelations(params.data.id);
  if (!surgery) {
    res.status(404).json({ error: "Műtét nem található" });
    return;
  }

  res.json(GetSurgeryResponse.parse(surgery));
});

router.patch("/surgeries/:id", async (req, res): Promise<void> => {
  const params = UpdateSurgeryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSurgeryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.scheduledDate) {
    updateData.scheduledDate = new Date(parsed.data.scheduledDate);
  }

  const [updated] = await db.update(surgeriesTable)
    .set(updateData)
    .where(eq(surgeriesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Műtét nem található" });
    return;
  }

  const surgery = await getSurgeryWithRelations(updated.id);
  res.json(UpdateSurgeryResponse.parse(surgery));
});

router.delete("/surgeries/:id", async (req, res): Promise<void> => {
  const params = DeleteSurgeryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(surgeriesTable).where(eq(surgeriesTable.id, params.data.id)).returning();

  if (!deleted) {
    res.status(404).json({ error: "Műtét nem található" });
    return;
  }

  res.sendStatus(204);
});

export default router;
