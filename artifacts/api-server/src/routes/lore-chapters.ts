import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, loreChaptersTable } from "@workspace/db";
import {
  CreateLoreChapterBody,
  ReorderLoreChaptersBody,
  UpdateLoreChapterParams,
  UpdateLoreChapterBody,
  DeleteLoreChapterParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function fmt(c: typeof loreChaptersTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

// GET /lore-chapters
router.get("/lore-chapters", async (_req, res): Promise<void> => {
  const chapters = await db
    .select()
    .from(loreChaptersTable)
    .orderBy(asc(loreChaptersTable.sortOrder), asc(loreChaptersTable.id));
  res.json(chapters.map(fmt));
});

// POST /lore-chapters
router.post("/lore-chapters", async (req, res): Promise<void> => {
  const parsed = CreateLoreChapterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [chapter] = await db.insert(loreChaptersTable).values(parsed.data).returning();
  res.status(201).json(fmt(chapter));
});

// PATCH /lore-chapters/reorder — before /:id
router.patch("/lore-chapters/reorder", async (req, res): Promise<void> => {
  const parsed = ReorderLoreChaptersBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await Promise.all(
    parsed.data.order.map((id, index) =>
      db.update(loreChaptersTable)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(loreChaptersTable.id, id))
    )
  );

  const chapters = await db.select().from(loreChaptersTable)
    .orderBy(asc(loreChaptersTable.sortOrder), asc(loreChaptersTable.id));
  res.json(chapters.map(fmt));
});

// PATCH /lore-chapters/:id
router.patch("/lore-chapters/:id", async (req, res): Promise<void> => {
  const params = UpdateLoreChapterParams.safeParse({ id: parseInt(req.params.id, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateLoreChapterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db.update(loreChaptersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(loreChaptersTable.id, params.data.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Chapter not found" }); return; }
  res.json(fmt(updated));
});

// DELETE /lore-chapters/:id
router.delete("/lore-chapters/:id", async (req, res): Promise<void> => {
  const parsed = DeleteLoreChapterParams.safeParse({ id: parseInt(req.params.id, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(loreChaptersTable)
    .where(eq(loreChaptersTable.id, parsed.data.id))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Chapter not found" }); return; }
  res.sendStatus(204);
});

export default router;
