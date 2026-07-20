import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Eye, EyeOff, LogOut } from "lucide-react";

const STORAGE_KEY = "naruto_admin_token";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem(STORAGE_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
}

// ── Context ────────────────────────────────────────────────────────────────

interface AdminAuthCtx {
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx>({ logout: () => {} });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

// ── Login Form ─────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setError(data.error ?? "Неверные данные.");
      } else {
        onLogin(data.token);
      }
    } catch {
      setError("Ошибка соединения с сервером.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-wide">Панель управления</h1>
          <p className="text-muted-foreground text-sm mt-1">Хроники Скрытых Деревень</p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Введите логин"
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Введите пароль"
                  className="bg-background pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Проверка..." : "Войти"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Доступ только для администратора
        </p>
      </div>
    </div>
  );
}

// ── Guard ──────────────────────────────────────────────────────────────────

type Status = "checking" | "authenticated" | "unauthenticated";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");

  const verify = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) { setStatus("unauthenticated"); return; }
    try {
      const res = await apiFetch("/api/admin/verify");
      setStatus(res.ok ? "authenticated" : "unauthenticated");
      if (!res.ok) localStorage.removeItem(STORAGE_KEY);
    } catch {
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => { void verify(); }, [verify]);

  const handleLogin = (token: string) => {
    localStorage.setItem(STORAGE_KEY, token);
    setStatus("authenticated");
  };

  const logout = useCallback(async () => {
    await apiFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    setStatus("unauthenticated");
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <ShieldAlert className="w-8 h-8 animate-pulse text-primary/50" />
          <span className="text-sm">Проверка доступа...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <AdminAuthContext.Provider value={{ logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// ── Logout Button (use inside admin pages) ─────────────────────────────────

export function AdminLogoutButton() {
  const { logout } = useAdminAuth();
  return (
    <button
      onClick={logout}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      title="Выйти из панели"
    >
      <LogOut className="w-3.5 h-3.5" />
      Выйти
    </button>
  );
}
