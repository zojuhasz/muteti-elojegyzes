import { Router, type IRouter } from "express";
import { db, operatingRoomsTable } from "@workspace/db";
import {
  ListOperatingRoomsResponse,
  CreateOperatingRoomBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/operating-rooms", async (_req, res): Promise<void> => {
  const rooms = await db.select().from(operatingRoomsTable).orderBy(operatingRoomsTable.name);
  res.json(ListOperatingRoomsResponse.parse(rooms));
});

router.post("/operating-rooms", async (req, res): Promise<void> => {
  const parsed = CreateOperatingRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [room] = await db.insert(operatingRoomsTable).values({
    ...parsed.data,
    isActive: parsed.data.isActive ?? true,
  }).returning();

  res.status(201).json(room);
});

export default router;
