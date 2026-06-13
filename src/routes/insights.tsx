import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/insights")({ component: Insights });

function Insights() {
  const { analysis, hasData } = useData();

  if (!hasData || !analysis) {
    return (
      <AppShell>
        <Card className="glass p-8 rounded-3xl text-center text-muted-foreground">Load data on the Dashboard first.</Card>
      </AppShell>
    );
  }

  // Heatmap: rows = days, cols = hours
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const max = Math.max(...analysis.heatmap.map((h) => h.value), 1);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-1">Insights</div>
          <h1 className="text-3xl font-bold tracking-tight">Deep patterns in your spending</h1>
        </div>

        <Card className="glass rounded-3xl p-6">
          <div className="text-lg font-semibold mb-1">Spending Heatmap</div>
          <div className="text-xs text-muted-foreground mb-4">When during the week do your rupees vanish?</div>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid" style={{ gridTemplateColumns: "60px repeat(24, 1fr)", gap: 4 }}>
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="text-[10px] text-muted-foreground text-center">{h}</div>
                ))}
                {days.map((d) => (
                  <Fragment key={d}>
                    <div className="text-xs text-muted-foreground py-1">{d}</div>
                    {Array.from({ length: 24 }, (_, h) => {
                      const cell = analysis.heatmap.find((c) => c.day === d && c.hour === h);
                      const v = cell?.value ?? 0;
                      const alpha = v / max;
                      return (
                        <div
                          key={h}
                          title={`${d} ${h}:00 — ${formatINR(v)}`}
                          className="rounded-md aspect-square"
                          style={{ background: `oklch(0.72 0.13 180 / ${0.08 + alpha * 0.85})` }}
                        />
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass rounded-3xl p-6">
            <div className="text-lg font-semibold mb-3">Top Merchants</div>
            <div className="space-y-2">
              {analysis.topMerchants.map((m, i) => (
                <div key={m.merchant} className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-md grid place-items-center bg-primary/15 text-primary text-xs font-bold">#{i + 1}</div>
                    <div>
                      <div className="font-medium text-sm">{m.merchant}</div>
                      <div className="text-xs text-muted-foreground">{m.count} txns</div>
                    </div>
                  </div>
                  <div className="font-semibold">{formatINR(m.amount)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass rounded-3xl p-6">
            <div className="text-lg font-semibold mb-3">Budget vs Actual</div>
            <div className="space-y-3">
              {analysis.byCategory.slice(0, 6).map((c) => {
                const budget = Math.max(2000, Math.round(c.amount * 0.8));
                const pct = Math.min(150, (c.amount / budget) * 100);
                const over = c.amount > budget;
                return (
                  <div key={c.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{c.category}</span>
                      <span className={over ? "text-destructive" : "text-secondary"}>
                        {formatINR(c.amount)} / {formatINR(budget)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-background/60 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, pct)}%`,
                          background: over ? "var(--gradient-danger)" : "var(--gradient-primary)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
