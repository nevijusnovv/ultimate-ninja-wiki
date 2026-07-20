import { useState } from "react";
import { Link } from "wouter";
import {
  useListSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
  getListSectionsQueryKey,
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
  Eye,
  EyeOff,
  GripVertical,
  Check,
  X,
} from "lucide-react";

type Section = {
  id: number;
  title: string;
  slug: string;
  description: string;
  link: string;
  icon: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  title: string;
  slug: string;
  description: string;
  link: string;
  icon: string;
  visible: boolean;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  link: "",
  icon: "",
  visible: true,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
}

export default function AdminSections() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugManual, setSlugManual] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: sections, isLoading } = useListSections();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const reorderSections = useReorderSections();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListSectionsQueryKey() });
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setSlugManual(false);
    setError(null);
    setShowForm(true);
  }

  function openEdit(section: Section) {
    setEditingId(section.id);
    setForm({
      title: section.title,
      slug: section.slug,
      description: section.description,
      link: section.link,
      icon: section.icon,
      visible: section.visible,
    });
    setSlugManual(true);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: slugManual ? f.slug : slugify(title),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) { setError("Введите заголовок"); return; }
    if (!form.slug.trim()) { setError("Введите slug"); return; }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      link: form.link.trim(),
      icon: form.icon.trim(),
      visible: form.visible,
    };

    if (editingId) {
      updateSection.mutate(
        { id: editingId, data: payload },
        { onSuccess: () => { invalidate(); closeForm(); }, onError: () => setError("Ошибка при сохранении") }
      );
    } else {
      const existingCount = sections?.length ?? 0;
      createSection.mutate(
        { data: { ...payload, sortOrder: existingCount } },
        { onSuccess: () => { invalidate(); closeForm(); }, onError: () => setError("Ошибка при создании") }
      );
    }
  }

  function handleDelete(id: number) {
    if (!confirm("Удалить раздел?")) return;
    deleteSection.mutate({ id }, { onSuccess: invalidate });
  }

  function handleToggleVisible(section: Section) {
    updateSection.mutate(
      { id: section.id, data: { visible: !section.visible } },
      { onSuccess: invalidate }
    );
  }

  // Drag-and-drop reorder
  function handleDragStart(id: number) {
    setDragItem(id);
  }

  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    setDragOver(id);
  }

  function handleDrop(targetId: number) {
    if (dragItem === null || dragItem === targetId || !sections) return;
    const ids = sections.map((s) => s.id);
    const fromIdx = ids.indexOf(dragItem);
    const toIdx = ids.indexOf(targetId);
    const newOrder = [...ids];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragItem);
    reorderSections.mutate({ data: { order: newOrder } }, { onSuccess: invalidate });
    setDragItem(null);
    setDragOver(null);
  }

  const isSaving = createSection.isPending || updateSection.isPending;

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
            <span className="text-sm font-medium">Разделы главной</span>
          </div>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <PlusCircle className="w-4 h-4" />
            Новый раздел
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold">Разделы главной страницы</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Перетащите для изменения порядка. Скрытые разделы не отображаются на главной.
          </p>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="mb-6 p-5 rounded-lg border border-border bg-card">
            <h2 className="font-serif font-semibold mb-4">
              {editingId ? "Редактировать раздел" : "Новый раздел"}
            </h2>
            {error && (
              <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-title">Заголовок <span className="text-destructive">*</span></Label>
                  <Input
                    id="s-title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Правила"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-slug">Slug <span className="text-muted-foreground text-xs font-normal">— авто</span></Label>
                  <Input
                    id="s-slug"
                    value={form.slug}
                    onChange={(e) => { setSlugManual(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
                    placeholder="pravila"
                    className="bg-background font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-desc">Краткое описание</Label>
                <Textarea
                  id="s-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Базовые правила игры, создание персонажа и другие важные сведения"
                  className="bg-background resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-link">Ссылка (href)</Label>
                  <Input
                    id="s-link"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder="/rules"
                    className="bg-background font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-icon">Иконка <span className="text-muted-foreground text-xs font-normal">— название из lucide-react</span></Label>
                  <Input
                    id="s-icon"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    placeholder="BookOpen"
                    className="bg-background font-mono text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="s-visible"
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                  className="accent-primary"
                />
                <Label htmlFor="s-visible" className="font-normal cursor-pointer">
                  Показывать на главной странице
                </Label>
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

        {/* Sections list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-card" />
            ))}
          </div>
        ) : !sections?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-xl">
            <p className="text-muted-foreground mb-4">Разделов пока нет.</p>
            <Button variant="outline" className="gap-2" onClick={openCreate}>
              <PlusCircle className="w-4 h-4" />
              Создать первый раздел
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section.id)}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDrop={() => handleDrop(section.id)}
                onDragEnd={() => { setDragItem(null); setDragOver(null); }}
                className={`flex items-center gap-3 px-4 py-3 border-b border-border/30 transition-colors cursor-grab active:cursor-grabbing
                  ${idx === sections.length - 1 ? "border-b-0" : ""}
                  ${dragOver === section.id ? "bg-primary/10" : "bg-card/30 hover:bg-card/60"}
                  ${dragItem === section.id ? "opacity-40" : ""}
                `}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${section.visible ? "text-foreground" : "text-muted-foreground line-through"}`}>
                      {section.title}
                    </span>
                    {!section.visible && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">скрыт</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {section.link && <span className="font-mono mr-2">{section.link}</span>}
                    {section.description && <span>{section.description.slice(0, 60)}{section.description.length > 60 ? "…" : ""}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${section.visible ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/40 hover:text-foreground"}`}
                    onClick={() => handleToggleVisible(section)}
                    title={section.visible ? "Скрыть" : "Показать"}
                  >
                    {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(section)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(section.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          Разделы с галочкой видимости будут отображаться на главной странице в установленном порядке.
        </p>
      </main>
    </div>
  );
}
