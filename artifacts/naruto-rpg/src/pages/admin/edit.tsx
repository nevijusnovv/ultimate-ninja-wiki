import { useRoute } from "wouter";
import ArticleForm from "./article-form";

export default function AdminEdit() {
  const [, params] = useRoute("/admin/edit/:id");
  const id = params?.id ? parseInt(params.id, 10) : undefined;

  if (!id) return null;
  return <ArticleForm articleId={id} />;
}
