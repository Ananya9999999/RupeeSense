import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-hero">
        <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-hero">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-fade-in">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 py-10 text-xs text-muted-foreground border-t border-border/40 mt-12 text-center">
        Built for ArcNight 2026 • Microsoft Innovations Club • VIT Chennai
      </footer>
    </div>
  );
}
