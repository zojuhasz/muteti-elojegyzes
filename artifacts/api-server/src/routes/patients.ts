import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, patientsTable } from "@workspace/db";
import {
  ListPatientsQueryParams,
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

router.get("/patients", async (req, res): Promise<void> => {
  const parsed = ListPatientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, status } = parsed.data;

  let query = db.select().from(patientsTable);

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

  let patients;
  if (conditions.length > 0) {
    patients = await query.where(conditions.length === 1 ? conditions[0] : conditions[0]).orderBy(patientsTable.lastName);
  } else {
    patients = await query.orderBy(patientsTable.lastName);
  }

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
