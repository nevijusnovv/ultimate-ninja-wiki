import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sectionsTable = pgTable("sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  link: text("link").notNull().default(""),
  icon: text("icon").notNull().default(""),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSectionSchema = createInsertSchema(sectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sectionsTable.$inferSelect;
