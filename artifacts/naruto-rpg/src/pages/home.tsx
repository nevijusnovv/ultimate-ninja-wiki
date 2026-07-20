import { Link } from "wouter";
import {
  useListRecentArticles,
  useGetWikiStats,
  useListSections,
} from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Scroll, Users, BookOpen, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (
    LucideIcons as unknown as Record<string, ComponentType<LucideProps>>
  )[name];
  if (!Icon) return <BookOpen {...props} />;
  return <Icon {...props} />;
}

export default function Home() {
  const { data: recentArticles, isLoading: isLoadingRecent } =
    useListRecentArticles();
  const { data: stats, isLoading: isLoadingStats } = useGetWikiStats();
  const { data: sections, isLoading: isLoadingSections } = useListSections({
    visibleOnly: true,
  });

  return (
    <Shell>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-background/95 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

        <div className="container mx-auto max-w-6xl relative z-10 px-4 text-center">
          <h1 className="text-5xl lg:text-7xl font-serif font-bold tracking-tight mb-6 text-foreground">
            Ultimate Ninja | Ролевая по Наруто
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Официальный архив правил, лора и механик ролевой игры. Исследуйте
            техники, изучайте мир и прокладывайте свой путь ниндзя.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/wiki"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Читать правила
            </Link>
            <Link
              href="/wiki"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Открыть Архив
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-12">
          {/* Dynamic Sections */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Разделы Архива
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingSections ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full bg-card" />
                ))
              ) : sections?.length ? (
                sections.map((section) => {
                  const card = (
                    <Card className="h-full bg-card hover:bg-accent/50 transition-colors border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span className="flex items-center gap-2">
                            {section.icon && (
                              <DynamicIcon
                                name={section.icon}
                                className="w-5 h-5 text-primary shrink-0"
                              />
                            )}
                            {section.title}
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </CardTitle>
                        {section.description && (
                          <CardDescription className="line-clamp-2">
                            {section.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  );

                  return section.link ? (
                    <Link
                      key={section.id}
                      href={section.link}
                      className="group block h-full"
                    >
                      {card}
                    </Link>
                  ) : (
                    <div key={section.id} className="group h-full">
                      {card}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                  Разделы ещё не добавлены.{" "}
                  <Link
                    href="/admin/sections"
                    className="text-primary hover:underline"
                  >
                    Управление разделами
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Recent Articles */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                <Scroll className="w-6 h-6 text-primary" />
                Свежие записи
              </h2>
              <Link
                href="/wiki"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Смотреть все <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {isLoadingRecent ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border border-border/50 rounded-lg"
                  >
                    <Skeleton className="h-5 w-3/4 mb-2 bg-muted" />
                    <Skeleton className="h-4 w-1/4 bg-muted" />
                  </div>
                ))
              ) : recentArticles?.length ? (
                recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/wiki/${article.id}`}
                    className="group block"
                  >
                    <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {format(new Date(article.updatedAt), "dd.MM.yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                        {article.categoryName}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-card/20">
                  <Scroll className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  Записей пока нет
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Stats Widget */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Свитки Знаний
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full bg-muted" />
                  <Skeleton className="h-24 w-full bg-muted" />
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background border border-border/50 text-center">
                      <div className="text-3xl font-serif font-bold text-primary">
                        {stats.totalArticles}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Статей
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border/50 text-center">
                      <div className="text-3xl font-serif font-bold text-primary">
                        {stats.totalCategories}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Разделов
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      По категориям
                    </h4>
                    {stats.categoryBreakdown.map((stat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {stat.categoryName}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {stat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Community Promo */}
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardHeader>
              <CardTitle className="font-serif">Присоединяйтесь</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Обсуждайте лор, ищите соигроков и участвуйте в глобальных
                ивентах в нашем сообществе.
              </p>
              <a
                href="https://vk.com/naruto_ultimate"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Users className="w-4 h-4 mr-2" />
                Начать играть
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
