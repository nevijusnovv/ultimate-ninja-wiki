import { useRoute, Link } from "wouter";
import { useGetArticle, getGetArticleQueryKey } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { ArrowLeft, Clock, Folder } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleDetail() {
  const [, params] = useRoute("/wiki/:id");
  const id = params?.id ? parseInt(params.id, 10) : undefined;

  const { data: article, isLoading, error } = useGetArticle(
    id ?? 0,
    { query: { queryKey: getGetArticleQueryKey(id ?? 0), enabled: !!id } }
  );

  if (error) {
    return (
      <Shell>
        <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="text-2xl font-serif text-destructive mb-4">Свиток поврежден или утерян</h1>
          <p className="text-muted-foreground mb-8">Не удалось загрузить запрошенную статью.</p>
          <Link href="/wiki" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Вернуться в архив
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/wiki" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Вернуться в архив
        </Link>

        {isLoading || !article ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 bg-muted" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24 bg-muted" />
              <Skeleton className="h-6 w-32 bg-muted" />
            </div>
            <Skeleton className="h-px w-full bg-border" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-4 w-full bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
              <Skeleton className="h-4 w-5/6 bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
            </div>
          </div>
        ) : (
          <article className="animate-in fade-in duration-700">
            <header className="mb-10">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border/50 py-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-primary" />
                  <Link href={`/wiki?category=${article.categoryId}`} className="hover:text-primary transition-colors">
                    {article.categoryName}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Обновлено {format(new Date(article.updatedAt), 'dd.MM.yyyy')}</span>
                </div>
              </div>
            </header>

            <div className="prose prose-invert prose-stone max-w-none 
              prose-headings:font-serif prose-headings:text-foreground
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-a:text-primary hover:prose-a:text-primary/80
              prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
              prose-pre:bg-card prose-pre:border prose-pre:border-border
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-img:rounded-lg prose-img:border prose-img:border-border/50
              prose-hr:border-border
              marker:text-primary"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>
          </article>
        )}
      </div>
    </Shell>
  );
}
