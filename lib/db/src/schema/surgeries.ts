import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";
import { operatingRoomsTable } from "./operatingRooms";
import { surgeonsTable } from "./surgeons";

export const surgeriesTable = pgTable("surgeries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  operatingRoomId: integer("operating_room_id").notNull().references(() => operatingRoomsTable.id),
  surgeonId: integer("surgeon_id").notNull().references(() => surgeonsTable.id),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
  estimatedDurationMinutes: integer("estimated_duration_minutes"),
  surgeryType: text("surgery_type"),
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSurgerySchema = createInsertSchema(surgeriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSurgery = z.infer<typeof insertSurgerySchema>;
export type Surgery = typeof surgeriesTable.$inferSelect;
