import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useListLoreChapters } from "@workspace/api-client-react";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChapterItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-lg border transition-colors duration-200 ${
        open
          ? "border-primary/40 bg-card"
          : "border-border/50 bg-card/40 hover:border-border"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left group"
      >
        <span className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ml-4 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-border/30 pt-4">
            {content ? (
              <div className="prose prose-invert prose-stone max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-strong:text-foreground prose-em:text-muted-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary
                prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground
                prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded
                prose-hr:border-border/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground/50 italic">Содержимое главы пока не добавлено.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Lore() {
  const { data: chapters, isLoading } = useListLoreChapters();

  return (
    <Shell>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Лор и Мироустройство
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Эпоха воюющих государств давно прошла, но мир так и не наступил.
            Изучите историю, чтобы понять настоящее.
          </p>
        </header>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-card" />
            ))
          ) : chapters?.length ? (
            chapters.map((ch) => (
              <ChapterItem key={ch.id} title={ch.title} content={ch.content} />
            ))
          ) : (
            <div className="py-16 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
              <p>Глав пока нет.</p>
              <a href="/admin/lore" className="text-primary hover:underline text-sm mt-2 inline-block">
                Добавить первую главу
              </a>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
