import { Router } from "express";
import { randomBytes } from "crypto";

const router = Router();

// In-memory token store (survives as long as the process is running)
const validTokens = new Set<string>();

function getCredentials() {
  const user = process.env["ADMIN_USER121"];
  const pass = process.env["ADMIN_PASSWORD323"];
  if (!user || !pass) {
    throw new Error("ADMIN_USER121 and ADMIN_PASSWORD323 environment variables must be set.");
  }
  return { user, pass };
}

export function requireAdminAuth(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  if (!validTokens.has(token)) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  next();
}

// POST /api/admin/login
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  let creds: { user: string; pass: string };
  try {
    creds = getCredentials();
  } catch {
    res.status(500).json({ error: "Server misconfiguration: admin credentials not set." });
    return;
  }

  if (!username || !password || username !== creds.user || password !== creds.pass) {
    res.status(401).json({ error: "Неверный логин или пароль." });
    return;
  }

  const token = randomBytes(32).toString("hex");
  validTokens.add(token);

  res.json({ token });
});

// GET /api/admin/verify
router.get("/admin/verify", (req, res) => {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const token = auth.slice(7);
  if (!validTokens.has(token)) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true });
});

// POST /api/admin/logout
router.post("/admin/logout", (req, res) => {
  const auth = req.headers["authorization"];
  if (auth?.startsWith("Bearer ")) {
    validTokens.delete(auth.slice(7));
  }
  res.json({ ok: true });
});

export default router;
