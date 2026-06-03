import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  birthDate: text("birth_date").notNull(),
  taj: text("taj"),
  phone: text("phone"),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  surgery: text("surgery"),
  surgeonName: text("surgeon_name"),
  assistant1: text("assistant1"),
  assistant2: text("assistant2"),
  assistant3: text("assistant3"),
  anesthesia: text("anesthesia"),
  isDaySurgery: boolean("is_day_surgery"),
  ward: text("ward"),
  orRoom: text("or_room"),
  surgeryDate: text("surgery_date"),
  surgeryOrder: integer("surgery_order"),
  bloodType: text("blood_type"),
  laterality: text("laterality"),
  laparoscope: text("laparoscope"),
  halo: text("halo"),
  createdBy: text("created_by"),
  department: text("department"),
  status: text("status").notNull().default("waiting"),
  patientType: text("patient_type"),
  admissionDate: text("admission_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
