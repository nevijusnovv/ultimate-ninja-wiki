import { Link } from "wouter";
import { ScrollText, Home, BookOpen, Flame, Scroll } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 mr-8">
            <Flame className="h-6 w-6 text-primary" />
          </Link>
          
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              Главная
            </Link>
            <Link href="/ranks" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              Ранги
            </Link>
            <Link href="/lore" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              Лор
            </Link>
            <Link href="/wiki" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              Архив (Wiki)
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card/50 py-8 mt-12">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p className="font-serif">Хроники Скрытых Деревень • Ролевой проект</p>
          <p className="mt-2 opacity-60">Знания, собранные поколениями шиноби.</p>
        </div>
      </footer>
    </div>
  );
}
