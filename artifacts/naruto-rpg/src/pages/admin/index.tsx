import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  useListArticles,
  useListCategories,
  useDeleteArticle,
  getListArticlesQueryKey,
  getListCategoriesQueryKey,
  getGetWikiStatsQueryKey,
  getListRecentArticlesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  PlusCircle,
  Pencil,
  Trash2,
  ShieldAlert,
  LayoutList,
  BookText,
  Search,
  ChevronRight,
} from "lucide-react";

type Article = {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  categoryName: string;
  parentId?: number | null;
  excerpt: string;
  updatedAt: string;
  createdAt: string;
};

type TreeNode = Article & { children: TreeNode[] };

function buildTree(articles: Article[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  articles.forEach((a) => map.set(a.id, { ...a, children: [] }));

  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function flattenTree(nodes: TreeNode[], depth = 0): { article: TreeNode; depth: number }[] {
  const result: { article: TreeNode; depth: number }[] = [];
  for (const node of nodes) {
    result.push({ article: node, depth });
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

function ArticleRow({
  article,
  depth,
  isLast,
  categoryMap,
  deletingId,
  onDelete,
}: {
  article: TreeNode;
  depth: number;
  isLast: boolean;
  categoryMap: Record<number, string>;
  deletingId: number | null;
  onDelete: (id: number) => void;
}) {
  return (
    <tr
      className={`border-b border-border/30 hover:bg-card/40 transition-colors ${isLast ? "border-b-0" : ""}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-1" style={{ paddingLeft: depth * 20 }}>
          {depth > 0 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
          )}
          <div>
            <div className={`font-medium ${depth > 0 ? "text-muted-foreground text-sm" : "text-foreground"}`}>
              {article.title}
            </div>
            <div className="text-xs text-muted-foreground/60 truncate max-w-xs mt-0.5">
              {article.excerpt}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
          {categoryMap[article.categoryId] ?? article.categoryName}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">
        {format(new Date(article.updatedAt), "dd.MM.yyyy")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <Link href={`/admin/edit/${article.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={deletingId === article.id}
            onClick={() => onDelete(article.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminIndex() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: articles, isLoading } = useListArticles();
  const { data: categories } = useListCategories();
  const deleteArticle = useDeleteArticle();

  const categoryMap = Object.fromEntries(
    (categories ?? []).map((c) => [c.id, c.name])
  );

  function handleDelete(id: number) {
    if (!confirm("Удалить статью? Это действие необратимо.")) return;
    setDeletingId(id);
    deleteArticle.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWikiStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListRecentArticlesQueryKey() });
          setDeletingId(null);
        },
        onError: () => setDeletingId(null),
      }
    );
  }

  // Filter articles by search query
  const filtered = useMemo(() => {
    if (!articles) return [];
    if (!search.trim()) return articles as Article[];
    const q = search.toLowerCase();
    return (articles as Article[]).filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      (categoryMap[a.categoryId] ?? a.categoryName).toLowerCase().includes(q)
    );
  }, [articles, search, categoryMap]);

  // When searching — flat list; when not — tree
  const rows = useMemo(() => {
    if (search.trim()) {
      return filtered.map((a) => ({ article: { ...a, children: [] } as TreeNode, depth: 0 }));
    }
    const tree = buildTree(filtered);
    return flattenTree(tree);
  }, [filtered, search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <Link
              href="/admin/sections"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm"
            >
              <LayoutList className="w-3.5 h-3.5" />
              Разделы главной
            </Link>
            <Link
              href="/admin/lore"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm"
            >
              <BookText className="w-3.5 h-3.5" />
              Главы лора
            </Link>
            <span className="font-serif font-bold text-base tracking-wider">
              Панель управления
            </span>
            <span className="text-muted-foreground text-sm">/ Статьи</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              На сайт
            </Link>
            <Link href="/admin/new">
              <Button size="sm" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Новая статья
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold">Статьи архива</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {articles?.length ?? 0} записей · иерархия отображается отступами
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по заголовку или категории..."
              className="pl-9 bg-card"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-card" />
            ))}
          </div>
        ) : !rows.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-xl">
            {search ? (
              <>
                <Search className="w-8 h-8 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">
                  Ничего не найдено по запросу «{search}»
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="text-primary hover:underline text-sm mt-2"
                >
                  Сбросить поиск
                </button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">Статей пока нет.</p>
                <Link href="/admin/new">
                  <Button variant="outline" className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Создать первую статью
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Заголовок</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Категория</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Обновлено</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ article, depth }, idx) => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    depth={depth}
                    isLast={idx === rows.length - 1}
                    categoryMap={categoryMap}
                    deletingId={deletingId}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!search && articles && articles.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Дочерние статьи отображаются с отступом под родительской. Назначить родителя можно при редактировании статьи.
          </p>
        )}
      </main>
    </div>
  );
}
