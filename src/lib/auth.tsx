import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "rupeesense.user";

function colorFromName(n: string) {
  const colors = ["#14B8A6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899"];
  let h = 0;
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  function persist(u: User | null) {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  }

  async function signIn(email: string, _password: string) {
    const name = email.split("@")[0] || "User";
    persist({ id: crypto.randomUUID(), email, name, avatarColor: colorFromName(name) });
  }
  async function signUp(name: string, email: string, _password: string) {
    persist({ id: crypto.randomUUID(), email, name, avatarColor: colorFromName(name) });
  }
  function signOut() { persist(null); }
  function updateProfile(patch: Partial<User>) {
    if (!user) return;
    const next = { ...user, ...patch };
    persist(next);
  }

  return <Ctx.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
