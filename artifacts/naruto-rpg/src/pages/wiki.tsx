import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useListArticles, useListCategories } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search, ScrollText, Filter, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wiki() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCategory = searchParams.get("category") || undefined;
  
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce for search
  useMemo(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  const { data: articles, isLoading: isLoadingArticles } = useListArticles({
    category: activeCategory,
    search: debouncedSearch || undefined,
  });

  return (
    <Shell>
      <div className="bg-card/30 border-b border-border/50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-4 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-primary" />
            Архив Свитка Огня
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Собрание знаний о техниках, правилах и мире игры. Ищите нужную информацию или просматривайте категории.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Поиск по архиву..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground mb-4">
              <Filter className="w-4 h-4" />
              Категории
            </h3>
            
            <button
              onClick={() => setActiveCategory(undefined)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                !activeCategory 
                  ? "bg-primary/20 text-primary font-medium border border-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent"
              }`}
            >
              Все записи
            </button>
            
            {isLoadingCategories ? (
               Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-muted" />
              ))
            ) : categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  activeCategory === cat.slug 
                    ? "bg-primary/20 text-primary font-medium border border-primary/20" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent"
                }`}
              >
                {cat.name}
                {cat.articleCount !== undefined && (
                  <span className="text-xs opacity-60 bg-background px-1.5 py-0.5 rounded-full border border-border">
                    {cat.articleCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Article List */}
        <div className="md:col-span-3">
          {isLoadingArticles ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 rounded-lg border border-border/50 bg-card/20">
                  <Skeleton className="h-6 w-1/3 mb-3 bg-muted" />
                  <Skeleton className="h-4 w-full mb-2 bg-muted" />
                  <Skeleton className="h-4 w-2/3 bg-muted" />
                </div>
              ))}
            </div>
          ) : articles?.length ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {articles.map((article) => (
                <Link key={article.id} href={`/wiki/${article.id}`} className="group block">
                  <div className="p-6 rounded-lg border border-border/50 bg-card hover:bg-accent/30 hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {article.categoryName}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(new Date(article.updatedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {article.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-border/50 rounded-xl bg-card/10">
              <Flame className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-serif font-medium text-foreground mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground max-w-sm">
                В архивах скрытых деревень нет записей, соответствующих вашему запросу.
              </p>
              {(searchQuery || activeCategory) && (
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory(undefined);
                  }}
                  className="mt-6 text-sm text-primary hover:underline"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </Shell>
  );
}
