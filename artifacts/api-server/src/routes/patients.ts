import { Router, type IRouter } from "express";
import { eq, ilike, or, and } from "drizzle-orm";
import { z } from "zod";
import { db, patientsTable } from "@workspace/db";
import {
  ListPatientsResponse,
  GetPatientParams,
  GetPatientResponse,
  CreatePatientBody,
  UpdatePatientParams,
  UpdatePatientBody,
  UpdatePatientResponse,
  DeletePatientParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const ListPatientsQuery = z.object({
  search: z.string().optional(),
  status: z.enum(["waiting", "scheduled", "operated", "cancelled", "imported"]).optional(),
  patientType: z.string().optional(),
  admissionDate: z.string().optional(),
});

router.get("/patients", async (req, res): Promise<void> => {
  const parsed = ListPatientsQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, status, patientType, admissionDate } = parsed.data;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(patientsTable.lastName, `%${search}%`),
        ilike(patientsTable.firstName, `%${search}%`),
        ilike(patientsTable.taj, `%${search}%`),
      ),
    );
  }
  if (status) {
    conditions.push(eq(patientsTable.status, status));
  }
  if (patientType) {
    conditions.push(eq(patientsTable.patientType, patientType));
  }
  if (admissionDate) {
    conditions.push(eq(patientsTable.admissionDate, admissionDate));
  }

  const patients = await db.select().from(patientsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(patientsTable.lastName)
    .limit(search ? 20 : 0);

  res.json(ListPatientsResponse.parse(patients));
});

router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [patient] = await db.insert(patientsTable).values({
    ...parsed.data,
    status: parsed.data.status ?? "waiting",
  }).returning();

  res.status(201).json(GetPatientResponse.parse(patient));
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));

  if (!patient) {
    res.status(404).json({ error: "Beteg nem található" });
    return;
  }

  res.json(GetPatientResponse.parse(patient));
});

router.patch("/patients/:id", async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [patient] = await db.update(patientsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(patientsTable.id, params.data.id))
    .returning();

  if (!patient) {
    res.status(404).json({ error: "Beteg nem található" });
    return;
  }

  res.json(UpdatePatientResponse.parse(patient));
});

router.delete("/patients/:id", async (req, res): Promise<void> => {
  const params = DeletePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db.delete(patientsTable).where(eq(patientsTable.id, params.data.id)).returning();

  if (!patient) {
    res.status(404).json({ error: "Beteg nem található" });
    return;
  }

  res.sendStatus(204);
});

export default router;
