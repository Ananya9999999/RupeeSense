import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ScoreRing";
import { Typewriter } from "@/components/Typewriter";
import { formatINR } from "@/lib/format";
import { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp, Wand2, Rocket, Flame, Coffee, ShoppingBag, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Transaction } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const LOADING_LINES = [
  "Judging your life choices...",
  "Counting your Swiggy sins...",
  "Consulting your future self...",
  "Tracking subscription leaks...",
  "Measuring wallet damage...",
];

function Dashboard() {
  const { user } = useAuth();
  const { hasData, analysis, loadDemo, transactions, addTransactions } = useData();
  const [analyzing, setAnalyzing] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (!analyzing) return;
    const id = setInterval(() => setLineIdx((i) => (i + 1) % LOADING_LINES.length), 900);
    return () => clearInterval(id);
  }, [analyzing]);

  function runAnalyze() {
    setAnalyzing(true);
    setTimeout(() => {
      if (!hasData) loadDemo();
      setAnalyzing(false);
      toast.success("Analysis complete. Brace yourself.");
    }, 2600);
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary mb-2">Welcome back</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hi {user?.name}, ready for some <span className="text-gradient">brutal honesty</span>?
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Connect your transactions and let RupeeSense reflect your financial reality back at you. Mathematically. Mercilessly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runAnalyze} disabled={analyzing} className="bg-[var(--gradient-primary)] text-primary-foreground shadow-glow hover:opacity-90">
              <Sparkles className="size-4 mr-2" /> Analyse My Spending
            </Button>
            <Button variant="outline" onClick={loadDemo}>
              <Rocket className="size-4 mr-2" /> Try Demo Data
            </Button>
          </div>
        </section>

        {analyzing && <AnalyzingPanel line={LOADING_LINES[lineIdx]} />}

        {!analyzing && <Onboarding onDemo={loadDemo} onAdd={addTransactions} hasData={hasData} />}

        {!analyzing && hasData && analysis && (
          <>
            <ShameAndScore analysis={analysis} />
            <PersonalityAndFraud analysis={analysis} />
            <CategoryAndTrends analysis={analysis} />
            <FutureSelf analysis={analysis} />
            <Opportunity analysis={analysis} />
            <Recommendations analysis={analysis} />
            <RecentTransactions transactions={transactions} />
          </>
        )}
      </div>
    </AppShell>
  );
}

/* ---------- Sections ---------- */

function AnalyzingPanel({ line }: { line: string }) {
  return (
    <Card className="glass-strong p-8 rounded-3xl overflow-hidden relative">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-2xl grid place-items-center bg-[var(--gradient-primary)] shadow-glow float-slow">
          <Sparkles className="size-6 text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm uppercase tracking-widest text-primary">AI Scanning</div>
          <div className="text-xl font-semibold mt-0.5">
            <Typewriter key={line} text={line} />
          </div>
        </div>
      </div>
      <div className="mt-6 h-2 rounded-full bg-card/60 overflow-hidden">
        <div className="h-full w-1/2 bg-[var(--gradient-primary)] shimmer rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
        {["Parsing UPI history", "Classifying merchants", "Detecting anomalies", "Building roast engine"].map((s) => (
          <div key={s} className="rounded-lg bg-card/40 px-3 py-2 border border-border/30">{s}</div>
        ))}
      </div>
    </Card>
  );
}

function Onboarding({ onDemo, onAdd, hasData }: { onDemo: () => void; onAdd: (t: Transaction[]) => void; hasData: boolean }) {
  const [pasted, setPasted] = useState("");
  const [open, setOpen] = useState(!hasData);

  function parseLines(text: string): Transaction[] {
    const lines = text.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);
    const txns: Transaction[] = [];
    for (const l of lines) {
      // Skip CSV header
      if (/^(merchant|name|description)[\s,]/i.test(l)) continue;
      const parts = l.split(/[,\t;]/).map((p) => p.trim().replace(/^"|"$/g, ""));
      const merchant = parts[0] || "Unknown";
      const amount = Number((parts[1] || "").replace(/[^\d.]/g, ""));
      if (!amount || Number.isNaN(amount)) continue;
      const category = (parts[2] as Transaction["category"]) || "Other";
      const date = parts[3] && !Number.isNaN(Date.parse(parts[3])) ? new Date(parts[3]).toISOString() : new Date().toISOString();
      txns.push({ id: crypto.randomUUID(), date, merchant, amount, category });
    }
    return txns;
  }

  function importPasted() {
    const txns = parseLines(pasted);
    if (!txns.length) {
      toast.error("Couldn't parse any transactions. Try lines like: Swiggy, 450, Food");
      return;
    }
    onAdd(txns);
    setPasted("");
    toast.success(`Imported ${txns.length} transactions`);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const txns = parseLines(text);
      if (!txns.length) {
        toast.error("No valid rows found. Expected: Merchant, Amount, Category, Date");
        return;
      }
      onAdd(txns);
      toast.success(`Imported ${txns.length} transactions from ${file.name}`);
    };
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsText(file);
    e.target.value = "";
  }

  if (hasData && !open) {
    return (
      <Card className="glass rounded-3xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-muted-foreground">Want to add more data? Paste UPI, upload a CSV, or enter manually.</div>
        <Button variant="outline" onClick={() => setOpen(true)}>Add transactions</Button>
      </Card>
    );
  }

  return (
    <Card className="glass rounded-3xl p-6 sm:p-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{hasData ? "Add more transactions" : "Connect your money"}</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                Paste UPI history, upload a CSV, or use demo data to see what RupeeSense thinks of your last 60 days.
              </p>
            </div>
            {hasData && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
            <ConnectTile icon="🟢" title="Google Pay" sub="Coming soon" />
            <ConnectTile icon="🏦" title="Bank Statement" sub="Upload PDF" />
            <label className="rounded-2xl p-4 bg-card/60 border border-border/40 hover:border-primary/40 transition cursor-pointer block">
              <div className="text-2xl">📄</div>
              <div className="font-medium mt-2">CSV Upload</div>
              <div className="text-xs text-muted-foreground">Click to choose file</div>
              <input type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={handleFile} />
            </label>
            <ConnectTile icon="✍️" title="Manual Entry" sub="Type below" />
          </div>
          {!hasData && (
            <div className="mt-6 flex gap-2">
              <Button onClick={onDemo} className="bg-[var(--gradient-primary)] text-primary-foreground shadow-glow">
                <Rocket className="size-4 mr-2" /> Use demo data
              </Button>
            </div>
          )}
        </div>
        <div>
          <Tabs defaultValue="paste">
            <TabsList className="bg-card/60">
              <TabsTrigger value="paste">Paste UPI</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="mt-3 space-y-3">
              <Textarea
                placeholder={`Swiggy, 450, Food\nFlipkart, 2499, Shopping\nNetflix, 799, Subscriptions`}
                rows={8}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                className="bg-card/40"
              />
              <Button onClick={importPasted} className="w-full">Import transactions</Button>
            </TabsContent>
            <TabsContent value="manual" className="mt-3">
              <ManualEntry onAdd={(t) => onAdd([t])} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
}

function ConnectTile({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="rounded-2xl p-4 bg-card/60 border border-border/40 hover:border-primary/40 transition cursor-pointer">
      <div className="text-2xl">{icon}</div>
      <div className="font-medium mt-2">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function ManualEntry({ onAdd }: { onAdd: (t: Transaction) => void }) {
  const [m, setM] = useState("");
  const [a, setA] = useState("");
  const [c, setC] = useState<Transaction["category"]>("Food");
  return (
    <div className="space-y-3">
      <input className="w-full h-10 rounded-md bg-card/40 px-3 border border-border" placeholder="Merchant" value={m} onChange={(e) => setM(e.target.value)} />
      <input className="w-full h-10 rounded-md bg-card/40 px-3 border border-border" placeholder="Amount (₹)" value={a} onChange={(e) => setA(e.target.value)} />
      <select className="w-full h-10 rounded-md bg-card/40 px-3 border border-border" value={c} onChange={(e) => setC(e.target.value as Transaction["category"])}>
        {["Food", "Shopping", "Bills", "Transport", "Entertainment", "Subscriptions", "Rent", "Other"].map((x) => (
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
      <Button
        onClick={() => {
          const amt = Number(a.replace(/[^\d.]/g, ""));
          if (!m || !amt) { toast.error("Enter merchant + amount"); return; }
          onAdd({ id: crypto.randomUUID(), date: new Date().toISOString(), merchant: m, amount: amt, category: c });
          setM(""); setA("");
          toast.success("Added");
        }}
        className="w-full"
      >Add transaction</Button>
    </div>
  );
}

function ShameAndScore({ analysis }: { analysis: NonNullable<ReturnType<typeof useData>["analysis"]> }) {
  const shameColor = analysis.shameScore <= 30 ? "from-emerald-500 to-teal-500" : analysis.shameScore <= 60 ? "from-amber-500 to-orange-500" : "from-orange-500 to-red-600";
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Shame-O-Meter — hero */}
      <Card className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border-0 relative overflow-hidden bg-gradient-to-br ${shameColor} text-white shadow-danger`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/90">
            <Flame className="size-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">Shame-O-Meter</span>
          </div>
          <div className="mt-4 flex items-end gap-6 flex-wrap">
            <div className="text-7xl sm:text-8xl font-black tracking-tighter leading-none">{analysis.shameScore}</div>
            <div>
              <div className="text-2xl font-bold">{analysis.shameLevel}</div>
              <div className="text-white/80 text-sm">Risk level based on spending behavior</div>
            </div>
          </div>
          <div className="mt-6 max-w-2xl text-lg leading-relaxed">
            <Typewriter text={analysis.shameRoast} />
          </div>
          <div className="mt-6 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white/90 rounded-full transition-all" style={{ width: `${analysis.shameScore}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/70">
            <span>Saint</span><span>Needs work</span><span>Danger</span><span>Disaster</span>
          </div>
        </div>
      </Card>

      {/* Health Score */}
      <Card className="glass rounded-3xl p-6 flex flex-col items-center">
        <div className="flex items-center gap-2 text-primary self-start">
          <ShieldCheck className="size-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Money Health Score</span>
        </div>
        <div className="my-4">
          <ScoreRing value={analysis.healthScore} label="Overall" />
        </div>
        <div className="w-full grid grid-cols-2 gap-2">
          {analysis.subscores.map((s) => (
            <div key={s.label} className="rounded-xl bg-card/60 p-3 border border-border/30">
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
              <div className="text-lg font-semibold">{s.value}</div>
              <div className="h-1.5 rounded-full bg-background/60 overflow-hidden mt-1">
                <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: "var(--gradient-primary)" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PersonalityAndFraud({ analysis }: { analysis: NonNullable<ReturnType<typeof useData>["analysis"]> }) {
  const p = analysis.personality;
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="glass rounded-3xl p-6 lg:col-span-1">
        <div className="text-xs uppercase tracking-widest text-primary mb-3">Financial Personality</div>
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl grid place-items-center text-3xl bg-card/70 border border-border/30">{p.icon}</div>
          <div>
            <div className="text-xl font-semibold">{p.name}</div>
            <div className="text-xs text-muted-foreground">Risk: <span className="text-foreground font-medium">{p.risk}</span></div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">{p.description}</p>
        <div className="mt-4 rounded-xl bg-primary/10 border border-primary/30 p-3 text-sm">
          <span className="font-semibold text-primary">Tip:</span> {p.tip}
        </div>
      </Card>

      <Card className="glass rounded-3xl p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-destructive mb-1 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" /> Fraud Detection
            </div>
            <div className="text-lg font-semibold">
              {analysis.suspicious.length > 0
                ? `${analysis.suspicious.length} suspicious transaction${analysis.suspicious.length > 1 ? "s" : ""}`
                : "No anomalies detected"}
            </div>
          </div>
        </div>
        {analysis.suspicious.length > 0 ? (
          <div className="mt-4 space-y-3">
            {analysis.suspicious.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-destructive/10 border border-destructive/40">
                <div>
                  <div className="font-medium">{t.merchant}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.suspiciousReason}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-destructive">{formatINR(t.amount)}</div>
                  <div className="text-[11px] text-muted-foreground">Risk score: 92</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">All your spending looks consistent with your usual patterns.</p>
        )}
      </Card>
    </div>
  );
}

const CHART_COLORS = ["#14B8A6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899", "#64748B"];

function CategoryAndTrends({ analysis }: { analysis: NonNullable<ReturnType<typeof useData>["analysis"]> }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Spending Breakdown</div>
            <div className="text-lg font-semibold">By Category</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-semibold">{formatINR(analysis.total)}</div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={analysis.byCategory} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {analysis.byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12 }} formatter={(v: number) => formatINR(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {analysis.byCategory.map((c, i) => (
            <div key={c.category} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {c.category}
              </span>
              <span className="text-muted-foreground">{formatINR(c.amount)} • {(c.pct * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass rounded-3xl p-6">
        <div className="text-xs uppercase tracking-widest text-primary">Daily Spend Trend</div>
        <div className="text-lg font-semibold mb-2">Last {analysis.daily.length} days</div>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={analysis.daily}>
              <defs>
                <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 10 }} hide />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12 }} formatter={(v: number) => formatINR(v)} />
              <Area type="monotone" dataKey="amount" stroke="#14B8A6" fill="url(#ag)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="glass rounded-3xl p-6 lg:col-span-2">
        <div className="text-xs uppercase tracking-widest text-primary">Category Comparison</div>
        <div className="text-lg font-semibold mb-2">Where your rupees actually go</div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={analysis.byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="category" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12 }} formatter={(v: number) => formatINR(v)} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {analysis.byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function FutureSelf({ analysis }: { analysis: NonNullable<ReturnType<typeof useData>["analysis"]> }) {
  const data = analysis.futureProjection.months.map((m, i) => ({
    month: m,
    Current: analysis.futureProjection.current[i],
    Improved: analysis.futureProjection.improved[i],
  }));
  const saved = analysis.recommendations.annualSavings;
  return (
    <Card className="glass rounded-3xl p-6">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">Future Self Projection</div>
          <div className="text-lg font-semibold">Where you'll be in 12 months</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Annual spend (current)" value={formatINR(analysis.futureProjection.current.at(-1) || 0)} tone="danger" />
          <Metric label="Potential savings" value={formatINR(saved)} tone="success" />
          <Metric label="Est. score improvement" value={`+${analysis.recommendations.scoreImprovement} pts`} tone="primary" />
        </div>
      </div>
      <div className="h-72 mt-3">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12 }} formatter={(v: number) => formatINR(v)} />
            <Legend wrapperStyle={{ color: "#94A3B8" }} />
            <Line type="monotone" dataKey="Current" stroke="#EF4444" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Improved" stroke="#22C55E" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "danger" | "success" | "primary" }) {
  const color = tone === "danger" ? "text-destructive" : tone === "success" ? "text-secondary" : "text-primary";
  return (
    <div className="rounded-xl bg-card/60 p-3 border border-border/30 min-w-32">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-base font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function Opportunity({ analysis }: { analysis: NonNullable<ReturnType<typeof useData>["analysis"]> }) {
  const icons = [Coffee, ShoppingBag, Sparkles, Rocket, TrendingUp];
  return (
    <Card className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">Opportunity Cost</div>
          <div className="text-lg font-semibold">What you could have bought instead</div>
        </div>
        <div className="text-xs text-muted-foreground">Based on your food + impulse spend</div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {analysis.opportunityCost.map((o, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={o.item} className="rounded-2xl p-4 bg-gradient-to-br from-card/80 to-card/40 border border-border/30 hover:border-accent/40 transition">
              <Icon className="size-5 text-accent" />
              <div className="mt-3 text-sm font-semibold leading-snug">{o.item}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatINR(o.price)} each</div>
              <div className="mt-3 text-2xl font-bold text-gradient">×{o.qty}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Recommendations({ analysis }: { analysis: NonNullable<ReturnType<typeof useData>["analysis"]> }) {
  const r = analysis.recommendations;
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="glass-strong rounded-3xl p-6 lg:col-span-1 relative overflow-hidden">
        <div className="text-xs uppercase tracking-widest text-secondary mb-2 flex items-center gap-1.5">
          <Wand2 className="size-3.5" /> Top AI Action
        </div>
        <div className="text-xl font-semibold leading-snug">{r.topAction}</div>
        <div className="mt-6 space-y-2">
          <Row label="Potential monthly savings" value={formatINR(r.monthlySavings)} accent="success" />
          <Row label="Potential annual savings" value={formatINR(r.annualSavings)} accent="success" />
          <Row label="Estimated score improvement" value={`+${r.scoreImprovement} pts`} accent="primary" />
        </div>
        <Link to="/advisor" className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          Ask the AI Advisor <ArrowRight className="size-3.5" />
        </Link>
      </Card>
      <Card className="glass rounded-3xl p-6 lg:col-span-2">
        <div className="text-xs uppercase tracking-widest text-primary mb-3">Savings Recommendations</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {r.items.map((it) => (
            <div key={it.title} className="rounded-2xl p-4 bg-card/60 border border-border/30">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{it.title}</div>
                <div className="text-secondary text-sm font-semibold whitespace-nowrap"><TrendingDown className="inline size-3.5 mr-1" />{formatINR(it.saves)}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{it.detail}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent: "success" | "primary" }) {
  const color = accent === "success" ? "text-secondary" : "text-primary";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const recent = transactions.slice(0, 8);
  return (
    <Card className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Recent Transactions</div>
        <Link to="/history" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="divide-y divide-border/40">
        {recent.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl grid place-items-center bg-card/70 border border-border/30 text-sm font-semibold">
                {t.merchant.slice(0, 1)}
              </div>
              <div>
                <div className="font-medium text-sm">{t.merchant}</div>
                <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("en-IN")} • {t.category}</div>
              </div>
            </div>
            <div className={`font-semibold ${t.suspicious ? "text-destructive" : ""}`}>{formatINR(t.amount)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
