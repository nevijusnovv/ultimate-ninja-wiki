import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useListCategories,
  useListArticles,
  useCreateArticle,
  useUpdateArticle,
  useGetArticle,
  getListArticlesQueryKey,
  getListCategoriesQueryKey,
  getGetWikiStatsQueryKey,
  getListRecentArticlesQueryKey,
  getGetArticleQueryKey,
  getGetArticleQueryOptions,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Eye, EyeOff, ShieldAlert, Save } from "lucide-react";
import { Link } from "wouter";

interface Props {
  articleId?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-а-яёa-z0-9]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Collect all descendant IDs to prevent circular parent assignment */
function getDescendantIds(articleId: number, articles: { id: number; parentId?: number | null }[]): Set<number> {
  const result = new Set<number>();
  const queue = [articleId];
  while (queue.length) {
    const current = queue.shift()!;
    for (const a of articles) {
      if (a.parentId === current && !result.has(a.id)) {
        result.add(a.id);
        queue.push(a.id);
      }
    }
  }
  return result;
}

export default function ArticleForm({ articleId }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isEditing = !!articleId;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [parentId, setParentId] = useState<string>("none");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useListCategories();
  const { data: allArticles } = useListArticles();
  const { data: article, isLoading: isLoadingArticle } = useGetArticle(
    articleId ?? 0,
    { query: { queryKey: getGetArticleQueryKey(articleId ?? 0), enabled: isEditing } }
  );

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const isSaving = createArticle.isPending || updateArticle.isPending;

  useEffect(() => {
    if (article && isEditing) {
      setTitle(article.title);
      setSlug(article.slug);
      setCategoryId(String(article.categoryId));
      setParentId(article.parentId ? String(article.parentId) : "none");
      setExcerpt(article.excerpt);
      setContent(article.content);
      setSlugManual(true);
    }
  }, [article, isEditing]);

  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  // Articles eligible as parents (exclude self + descendants)
  const parentOptions = (() => {
    if (!allArticles) return [];
    const excluded = new Set<number>();
    if (articleId) {
      excluded.add(articleId);
      getDescendantIds(articleId, allArticles as { id: number; parentId?: number | null }[]).forEach((id) => excluded.add(id));
    }
    return (allArticles as { id: number; title: string; parentId?: number | null }[]).filter((a) => !excluded.has(a.id));
  })();

  function invalidateAll(id?: number) {
    queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetWikiStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListRecentArticlesQueryKey() });
    if (id) {
      queryClient.invalidateQueries({ queryKey: getGetArticleQueryKey(id) });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Заполните заголовок."); return; }
    if (!slug.trim()) { setError("Заполните slug."); return; }
    if (!categoryId) { setError("Выберите категорию."); return; }
    if (!excerpt.trim()) { setError("Заполните краткое описание."); return; }
    if (!content.trim()) { setError("Добавьте текст статьи."); return; }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      categoryId: parseInt(categoryId, 10),
      parentId: parentId !== "none" ? parseInt(parentId, 10) : null,
      excerpt: excerpt.trim(),
      content: content,
    };

    if (isEditing) {
      updateArticle.mutate(
        { id: articleId, data: payload },
        {
          onSuccess: () => { invalidateAll(articleId); navigate("/admin"); },
          onError: (err: unknown) => {
            setError(err instanceof Error ? err.message : "Ошибка при сохранении");
          },
        }
      );
    } else {
      createArticle.mutate(
        { data: payload },
        {
          onSuccess: (created) => { invalidateAll(created.id); navigate("/admin"); },
          onError: (err: unknown) => {
            setError(err instanceof Error ? err.message : "Ошибка при создании");
          },
        }
      );
    }
  }

  if (isEditing && isLoadingArticle) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64 bg-card" />
          <Skeleton className="h-10 w-full bg-card" />
          <Skeleton className="h-10 w-full bg-card" />
          <Skeleton className="h-48 w-full bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              Статьи
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium">
              {isEditing ? "Редактировать" : "Новая статья"}
            </span>
          </div>
          <Button
            type="submit"
            form="article-form"
            size="sm"
            className="gap-2"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите заголовок статьи"
                className="bg-card"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория <span className="text-destructive">*</span></Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category" className="bg-card">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (URL){" "}
                <span className="text-muted-foreground text-xs font-normal">— автоматически из заголовка</span>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                placeholder="url-slug-stati"
                className="bg-card font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">
                Родительская статья{" "}
                <span className="text-muted-foreground text-xs font-normal">— для иерархии</span>
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parent" className="bg-card">
                  <SelectValue placeholder="Нет (корневая статья)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— нет родителя (корневая)</SelectItem>
                  {parentOptions.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Краткое описание <span className="text-destructive">*</span></Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Одно-два предложения для карточки статьи в списке"
              className="bg-card resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">
                Текст статьи <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground text-xs font-normal">— поддерживает Markdown</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-xs h-7 text-muted-foreground"
                onClick={() => setPreviewMode((v) => !v)}
              >
                {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {previewMode ? "Редактор" : "Превью"}
              </Button>
            </div>

            {previewMode ? (
              <div
                className="min-h-[400px] p-4 rounded-md border border-input bg-card overflow-auto
                  prose prose-invert prose-stone max-w-none
                  prose-headings:font-serif prose-headings:text-foreground
                  prose-a:text-primary
                  prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
                  prose-pre:bg-background prose-pre:border prose-pre:border-border
                  prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-hr:border-border
                  marker:text-primary"
              >
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Начните вводить текст в редакторе, чтобы увидеть превью.</p>
                )}
              </div>
            ) : (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`# Заголовок статьи\n\nВведите текст статьи с поддержкой **Markdown**.\n\n## Подзаголовок\n\nСписки, таблицы, \`код\` и цитаты > работают из коробки.`}
                className="bg-card font-mono text-sm resize-none leading-relaxed"
                rows={22}
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-2 pb-8 border-t border-border/50">
            <Link href="/admin">
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Сохранение..." : isEditing ? "Сохранить изменения" : "Создать статью"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
