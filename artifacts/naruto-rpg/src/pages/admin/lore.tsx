import { useState } from "react";
import { Link } from "wouter";
import {
  useListLoreChapters,
  useCreateLoreChapter,
  useUpdateLoreChapter,
  useDeleteLoreChapter,
  useReorderLoreChapters,
  getListLoreChaptersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldAlert,
  ArrowLeft,
  PlusCircle,
  Pencil,
  Trash2,
  GripVertical,
  Check,
  X,
  BookText,
} from "lucide-react";

type Chapter = {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type FormState = { title: string; content: string };
const emptyForm: FormState = { title: "", content: "" };

export default function AdminLore() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const { data: chapters, isLoading } = useListLoreChapters();
  const createChapter = useCreateLoreChapter();
  const updateChapter = useUpdateLoreChapter();
  const deleteChapter = useDeleteLoreChapter();
  const reorderChapters = useReorderLoreChapters();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListLoreChaptersQueryKey() });
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(ch: Chapter) {
    setEditingId(ch.id);
    setForm({ title: ch.title, content: ch.content });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) { setError("Введите заголовок главы"); return; }

    const payload = { title: form.title.trim(), content: form.content.trim() };

    if (editingId) {
      updateChapter.mutate(
        { id: editingId, data: payload },
        { onSuccess: () => { invalidate(); closeForm(); }, onError: () => setError("Ошибка при сохранении") }
      );
    } else {
      createChapter.mutate(
        { data: { ...payload, sortOrder: chapters?.length ?? 0 } },
        { onSuccess: () => { invalidate(); closeForm(); }, onError: () => setError("Ошибка при создании") }
      );
    }
  }

  function handleDelete(id: number) {
    if (!confirm("Удалить эту главу?")) return;
    deleteChapter.mutate({ id }, { onSuccess: invalidate });
  }

  function handleDragStart(id: number) { setDragItem(id); }
  function handleDragOver(e: React.DragEvent, id: number) { e.preventDefault(); setDragOver(id); }
  function handleDrop(targetId: number) {
    if (dragItem === null || dragItem === targetId || !chapters) return;
    const ids = chapters.map((c) => c.id);
    const from = ids.indexOf(dragItem);
    const to = ids.indexOf(targetId);
    const newOrder = [...ids];
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, dragItem);
    reorderChapters.mutate({ data: { order: newOrder } }, { onSuccess: invalidate });
    setDragItem(null);
    setDragOver(null);
  }

  const isSaving = createChapter.isPending || updateChapter.isPending;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              Панель
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium">Главы лора</span>
          </div>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <PlusCircle className="w-4 h-4" />
            Новая глава
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            <BookText className="w-6 h-6 text-primary" />
            Главы лора
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Перетащите для изменения порядка. Главы отображаются на странице «Лор» в виде аккордеона.
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6 p-5 rounded-lg border border-border bg-card">
            <h2 className="font-serif font-semibold mb-4">
              {editingId ? "Редактировать главу" : "Новая глава"}
            </h2>
            {error && (
              <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ch-title">
                  Заголовок главы <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ch-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Пять Великих Стран Шиноби"
                  className="bg-background"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ch-content">
                  Текст главы{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    — поддерживает Markdown: **жирный**, *курсив*, ## заголовок, - список, &gt; цитата
                  </span>
                </Label>
                <Textarea
                  id="ch-content"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder={"## Вступление\n\nПервый абзац главы...\n\nВторой абзац. Можно использовать **жирный** и *курсив*.\n\n- Пункт списка\n- Ещё пункт\n\n> Цитата или важная заметка"}
                  className="bg-background resize-y font-mono text-sm"
                  rows={10}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" disabled={isSaving}>
                  <Check className="w-4 h-4 mr-1.5" />
                  {isSaving ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                  <X className="w-4 h-4 mr-1.5" />
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-card" />
            ))}
          </div>
        ) : !chapters?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-xl">
            <BookText className="w-10 h-10 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground mb-4">Глав пока нет.</p>
            <Button variant="outline" className="gap-2" onClick={openCreate}>
              <PlusCircle className="w-4 h-4" />
              Создать первую главу
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            {chapters.map((ch, idx) => (
              <div
                key={ch.id}
                draggable
                onDragStart={() => handleDragStart(ch.id)}
                onDragOver={(e) => handleDragOver(e, ch.id)}
                onDrop={() => handleDrop(ch.id)}
                onDragEnd={() => { setDragItem(null); setDragOver(null); }}
                className={`flex items-center gap-3 px-4 py-3 border-b border-border/30 transition-colors cursor-grab active:cursor-grabbing
                  ${idx === chapters.length - 1 ? "border-b-0" : ""}
                  ${dragOver === ch.id ? "bg-primary/10" : "bg-card/30 hover:bg-card/60"}
                  ${dragItem === ch.id ? "opacity-40" : ""}
                `}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{ch.title}</p>
                  {ch.content && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {ch.content.slice(0, 80)}{ch.content.length > 80 ? "…" : ""}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(ch)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(ch.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          Главы отображаются на странице{" "}
          <Link href="/lore" className="text-primary hover:underline">
            /lore
          </Link>{" "}
          в том порядке, который задан здесь.
        </p>
      </main>
    </div>
  );
}
