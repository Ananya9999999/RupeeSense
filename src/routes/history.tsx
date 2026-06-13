import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatINR } from "@/lib/format";
import { useMemo } from "react";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function groupBy(transactions: { date: string; amount: number }[], key: "day" | "week" | "month" | "year") {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const d = new Date(t.date);
    let k = "";
    if (key === "day") k = d.toISOString().slice(0, 10);
    else if (key === "week") {
      const tmp = new Date(d);
      tmp.setDate(d.getDate() - d.getDay());
      k = "W " + tmp.toISOString().slice(0, 10);
    } else if (key === "month") k = d.toISOString().slice(0, 7);
    else k = d.getFullYear().toString();
    map.set(k, (map.get(k) ?? 0) + t.amount);
  }
  return [...map.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => a.label.localeCompare(b.label));
}

function HistoryPage() {
  const { transactions, hasData } = useData();

  const views = useMemo(() => ({
    day: groupBy(transactions, "day"),
    week: groupBy(transactions, "week"),
    month: groupBy(transactions, "month"),
    year: groupBy(transactions, "year"),
  }), [transactions]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-1">History & Trends</div>
          <h1 className="text-3xl font-bold tracking-tight">Your spending across time</h1>
        </div>

        {!hasData ? (
          <Card className="glass p-8 rounded-3xl text-center text-muted-foreground">
            No transactions yet. Go to the Dashboard and load demo data to populate history.
          </Card>
        ) : (
          <>
            <Tabs defaultValue="month">
              <TabsList className="bg-card/60">
                <TabsTrigger value="day">Daily</TabsTrigger>
                <TabsTrigger value="week">Weekly</TabsTrigger>
                <TabsTrigger value="month">Monthly</TabsTrigger>
                <TabsTrigger value="year">Yearly</TabsTrigger>
              </TabsList>
              {(["day", "week", "month", "year"] as const).map((k) => (
                <TabsContent key={k} value={k} className="mt-4">
                  <Card className="glass rounded-3xl p-6">
                    <div className="text-lg font-semibold mb-3 capitalize">{k} view</div>
                    <div className="h-80">
                      <ResponsiveContainer>
                        <BarChart data={views[k]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                          <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} />
                          <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12 }} formatter={(v: number) => formatINR(v)} />
                          <Bar dataKey="amount" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            <ComparisonGrid views={views} />

            <Card className="glass rounded-3xl p-6">
              <div className="text-lg font-semibold mb-3">All transactions</div>
              <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl grid place-items-center bg-card/70 border border-border/30 text-sm font-semibold">
                        {t.merchant.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{t.merchant}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("en-IN")} • {t.category}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${t.suspicious ? "text-destructive" : ""}`}>{formatINR(t.amount)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ComparisonGrid({ views }: { views: { week: { amount: number }[]; month: { amount: number }[]; year: { amount: number }[] } }) {
  function delta(arr: { amount: number }[]) {
    const a = arr.at(-1)?.amount ?? 0;
    const b = arr.at(-2)?.amount ?? 0;
    const diff = a - b;
    const pct = b ? (diff / b) * 100 : 0;
    return { a, b, diff, pct };
  }
  const w = delta(views.week);
  const m = delta(views.month);
  const y = delta(views.year);
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        { title: "This week vs last week", d: w },
        { title: "This month vs last month", d: m },
        { title: "This year vs last year", d: y },
      ].map(({ title, d }) => (
        <Card key={title} className="glass rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold mt-1">{formatINR(d.a)}</div>
          <div className={`text-sm mt-1 ${d.diff > 0 ? "text-destructive" : "text-secondary"}`}>
            {d.diff > 0 ? "▲" : "▼"} {formatINR(Math.abs(d.diff))} ({d.pct.toFixed(1)}%)
          </div>
        </Card>
      ))}
    </div>
  );
}
