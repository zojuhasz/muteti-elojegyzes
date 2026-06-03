import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, surgeonsTable } from "@workspace/db";
import { ListSurgeonsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const CreateSurgeonBody = z.object({
  firstName: z.string(),
  lastName: z.string(),
  specialization: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get("/surgeons", async (_req, res): Promise<void> => {
  const surgeons = await db.select().from(surgeonsTable).orderBy(surgeonsTable.lastName);
  res.json(ListSurgeonsResponse.parse(surgeons));
});

router.post("/surgeons", async (req, res): Promise<void> => {
  const parsed = CreateSurgeonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [surgeon] = await db.insert(surgeonsTable).values({
    ...parsed.data,
    isActive: parsed.data.isActive ?? true,
  }).returning();

  res.status(201).json(surgeon);
});

export default router;
