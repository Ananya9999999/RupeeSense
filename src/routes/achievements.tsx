import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Lock, Trophy } from "lucide-react";

export const Route = createFileRoute("/achievements")({ component: Achievements });

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (ctx: { txnCount: number; foodMax: number; categories: number }) => number; // 0..1
}

const BADGES: Badge[] = [
  { id: "first-analysis", title: "First Analysis", description: "Ran your first spending analysis.", icon: "🪞", requirement: ({ txnCount }) => (txnCount > 0 ? 1 : 0) },
  { id: "budget-beginner", title: "Budget Beginner", description: "Logged 10+ transactions.", icon: "📒", requirement: ({ txnCount }) => Math.min(1, txnCount / 10) },
  { id: "smart-saver", title: "Smart Saver", description: "Stayed under ₹500 food spend on a day.", icon: "💎", requirement: ({ foodMax }) => (foodMax && foodMax < 500 ? 1 : 0.4) },
  { id: "saving-streak", title: "Saving Streak", description: "3 days in a row under daily avg.", icon: "🔥", requirement: () => 0.6 },
  { id: "no-delivery-week", title: "No Delivery Week", description: "Zero food delivery for 7 days.", icon: "🥗", requirement: () => 0.2 },
  { id: "financial-discipline-pro", title: "Financial Discipline Pro", description: "Spent across 5+ categories with budget held.", icon: "🏆", requirement: ({ categories }) => Math.min(1, categories / 5) },
];

function Achievements() {
  const { transactions, analysis, achievements } = useData();

  const ctx = {
    txnCount: transactions.length,
    foodMax: 0,
    categories: analysis?.byCategory.length ?? 0,
  };

  // compute foodMax
  const byDay = new Map<string, number>();
  for (const t of transactions) if (t.category === "Food") {
    const k = t.date.slice(0, 10);
    byDay.set(k, (byDay.get(k) ?? 0) + t.amount);
  }
  ctx.foodMax = byDay.size ? Math.min(...byDay.values()) : 0;

  const items = BADGES.map((b) => {
    const progress = Math.max(0, Math.min(1, b.requirement(ctx)));
    const unlocked = achievements.includes(b.id) || progress >= 1;
    return { ...b, progress, unlocked };
  });

  const unlockedCount = items.filter((x) => x.unlocked).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent mb-1">Achievements</div>
            <h1 className="text-3xl font-bold tracking-tight">Earn badges for behaving</h1>
          </div>
          <Card className="glass rounded-2xl px-5 py-3 flex items-center gap-3">
            <Trophy className="size-5 text-accent" />
            <div>
              <div className="text-xs text-muted-foreground">Unlocked</div>
              <div className="font-semibold">{unlockedCount} / {BADGES.length}</div>
            </div>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b) => (
            <Card key={b.id} className={`rounded-3xl p-6 relative overflow-hidden border ${b.unlocked ? "glass-strong border-primary/40 shadow-glow" : "bg-card/40 border-border/30 opacity-90"}`}>
              <div className="flex items-center gap-3">
                <div className={`size-14 rounded-2xl grid place-items-center text-3xl ${b.unlocked ? "bg-[var(--gradient-primary)]" : "bg-card/70"}`}>
                  {b.unlocked ? b.icon : <Lock className="size-5 text-muted-foreground" />}
                </div>
                <div>
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-xs text-muted-foreground">{b.description}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.progress * 100}%`, background: "var(--gradient-primary)" }} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{Math.round(b.progress * 100)}% complete</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
