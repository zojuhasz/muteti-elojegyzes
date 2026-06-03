import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const operatingRoomsTable = pgTable("operating_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().default(""),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertOperatingRoomSchema = createInsertSchema(operatingRoomsTable).omit({ id: true });
export type InsertOperatingRoom = z.infer<typeof insertOperatingRoomSchema>;
export type OperatingRoom = typeof operatingRoomsTable.$inferSelect;
