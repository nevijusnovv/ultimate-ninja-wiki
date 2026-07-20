import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const loreChaptersTable = pgTable("lore_chapters", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLoreChapterSchema = createInsertSchema(loreChaptersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLoreChapter = z.infer<typeof insertLoreChapterSchema>;
export type LoreChapter = typeof loreChaptersTable.$inferSelect;
