import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, sectionsTable } from "@workspace/db";
import {
  ListSectionsQueryParams,
  CreateSectionBody,
  ReorderSectionsBody,
  UpdateSectionParams,
  UpdateSectionBody,
  DeleteSectionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatSection(s: typeof sectionsTable.$inferSelect) {
  return {
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// GET /sections
router.get("/sections", async (req, res): Promise<void> => {
  const parsed = ListSectionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(sectionsTable).$dynamic();

  if (parsed.data.visibleOnly) {
    query = query.where(eq(sectionsTable.visible, true));
  }

  const sections = await query.orderBy(asc(sectionsTable.sortOrder), asc(sectionsTable.id));
  res.json(sections.map(formatSection));
});

// POST /sections
router.post("/sections", async (req, res): Promise<void> => {
  const parsed = CreateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db.insert(sectionsTable).values(parsed.data).returning();
  res.status(201).json(formatSection(section));
});

// PATCH /sections/reorder — must be before /:id
router.patch("/sections/reorder", async (req, res): Promise<void> => {
  const parsed = ReorderSectionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { order } = parsed.data;

  await Promise.all(
    order.map((id, index) =>
      db
        .update(sectionsTable)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(sectionsTable.id, id))
    )
  );

  const sections = await db
    .select()
    .from(sectionsTable)
    .orderBy(asc(sectionsTable.sortOrder), asc(sectionsTable.id));

  res.json(sections.map(formatSection));
});

// PATCH /sections/:id
router.patch("/sections/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSectionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(sectionsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(sectionsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  res.json(formatSection(updated));
});

// DELETE /sections/:id
router.delete("/sections/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteSectionParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(sectionsTable)
    .where(eq(sectionsTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
