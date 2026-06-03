import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surgeonsTable = pgTable("surgeons", {
  id: serial("id").primaryKey(),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  specialty: text("specialty"),
  phone: text("phone"),
  username: text("username"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertSurgeonSchema = createInsertSchema(surgeonsTable).omit({ id: true });
export type InsertSurgeon = z.infer<typeof insertSurgeonSchema>;
export type Surgeon = typeof surgeonsTable.$inferSelect;
