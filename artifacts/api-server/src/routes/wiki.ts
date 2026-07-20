import { Router, type IRouter } from "express";
import { eq, ilike, desc, count, sql } from "drizzle-orm";
import { db, articlesTable, categoriesTable } from "@workspace/db";
import {
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  UpdateArticleParams,
  UpdateArticleBody,
  DeleteArticleParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// GET /categories
router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      articleCount: count(articlesTable.id),
    })
    .from(categoriesTable)
    .leftJoin(articlesTable, eq(articlesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.id);

  res.json(rows);
});

// GET /articles
router.get("/articles", async (req, res): Promise<void> => {
  const parsed = ListArticlesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, search } = parsed.data;

  let query = db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      slug: articlesTable.slug,
      categoryId: articlesTable.categoryId,
      categoryName: categoriesTable.name,
      excerpt: articlesTable.excerpt,
      updatedAt: articlesTable.updatedAt,
    })
    .from(articlesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, articlesTable.categoryId))
    .$dynamic();

  const conditions = [];
  if (category) {
    conditions.push(eq(categoriesTable.slug, category));
  }
  if (search) {
    conditions.push(ilike(articlesTable.title, `%${search}%`));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const articles = await query.orderBy(desc(articlesTable.updatedAt));
  res.json(articles.map(a => ({ ...a, updatedAt: a.updatedAt.toISOString() })));
});

// GET /articles/recent
router.get("/articles/recent", async (_req, res): Promise<void> => {
  const articles = await db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      slug: articlesTable.slug,
      categoryId: articlesTable.categoryId,
      categoryName: categoriesTable.name,
      excerpt: articlesTable.excerpt,
      updatedAt: articlesTable.updatedAt,
    })
    .from(articlesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, articlesTable.categoryId))
    .orderBy(desc(articlesTable.updatedAt))
    .limit(5);

  res.json(articles.map(a => ({ ...a, updatedAt: a.updatedAt.toISOString() })));
});

// GET /articles/stats
router.get("/articles/stats", async (_req, res): Promise<void> => {
  const totalArticlesRow = await db.select({ value: count() }).from(articlesTable);
  const totalCategoriesRow = await db.select({ value: count() }).from(categoriesTable);
  const breakdown = await db
    .select({
      categoryName: categoriesTable.name,
      count: count(articlesTable.id),
    })
    .from(categoriesTable)
    .leftJoin(articlesTable, eq(articlesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id, categoriesTable.name)
    .orderBy(categoriesTable.id);

  res.json({
    totalArticles: totalArticlesRow[0]?.value ?? 0,
    totalCategories: totalCategoriesRow[0]?.value ?? 0,
    categoryBreakdown: breakdown.map(b => ({
      categoryName: b.categoryName,
      count: Number(b.count),
    })),
  });
});

// GET /articles/:id
router.get("/articles/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetArticleParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [article] = await db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      slug: articlesTable.slug,
      categoryId: articlesTable.categoryId,
      categoryName: categoriesTable.name,
      content: articlesTable.content,
      excerpt: articlesTable.excerpt,
      createdAt: articlesTable.createdAt,
      updatedAt: articlesTable.updatedAt,
    })
    .from(articlesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, articlesTable.categoryId))
    .where(eq(articlesTable.id, parsed.data.id));

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  });
});

// POST /articles
router.post("/articles", async (req, res): Promise<void> => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [article] = await db
    .insert(articlesTable)
    .values(parsed.data)
    .returning();

  const [withCategory] = await db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      slug: articlesTable.slug,
      categoryId: articlesTable.categoryId,
      categoryName: categoriesTable.name,
      content: articlesTable.content,
      excerpt: articlesTable.excerpt,
      createdAt: articlesTable.createdAt,
      updatedAt: articlesTable.updatedAt,
    })
    .from(articlesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, articlesTable.categoryId))
    .where(eq(articlesTable.id, article.id));

  res.status(201).json({
    ...withCategory,
    createdAt: withCategory!.createdAt.toISOString(),
    updatedAt: withCategory!.updatedAt.toISOString(),
  });
});

// PATCH /articles/:id
router.patch("/articles/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateArticleParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(articlesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(articlesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  const [withCategory] = await db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      slug: articlesTable.slug,
      categoryId: articlesTable.categoryId,
      categoryName: categoriesTable.name,
      content: articlesTable.content,
      excerpt: articlesTable.excerpt,
      createdAt: articlesTable.createdAt,
      updatedAt: articlesTable.updatedAt,
    })
    .from(articlesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, articlesTable.categoryId))
    .where(eq(articlesTable.id, params.data.id));

  res.json({
    ...withCategory,
    createdAt: withCategory!.createdAt.toISOString(),
    updatedAt: withCategory!.updatedAt.toISOString(),
  });
});

// DELETE /articles/:id
router.delete("/articles/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteArticleParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(articlesTable)
    .where(eq(articlesTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
