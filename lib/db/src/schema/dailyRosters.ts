import { pgTable, text, serial, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyRostersTable = pgTable("daily_rosters", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  surgeryResponsible1: text("surgery_responsible_1"),
  surgeryResponsible2: text("surgery_responsible_2"),
  acuteResponsible1: text("acute_responsible_1"),
  acuteResponsible2: text("acute_responsible_2"),
  ambulanceNotes: text("ambulance_notes"),
  dayOff: text("day_off"),
  absent: text("absent"),
  surgeryStartTime: text("surgery_start_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDailyRosterSchema = createInsertSchema(dailyRostersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDailyRoster = z.infer<typeof insertDailyRosterSchema>;
export type DailyRoster = typeof dailyRostersTable.$inferSelect;
