import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useData } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/advisor")({ component: Advisor });

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "How can I save money?",
  "Where am I overspending?",
  "Can I afford a ₹50,000 trip?",
  "What should my monthly budget be?",
  "How do I improve my score?",
];

function Advisor() {
  const { user } = useAuth();
  const { analysis } = useData();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: `Hey ${user?.name ?? "friend"} 👋 I'm your AI Financial Mirror. Ask me anything about your money — I've already read your transactions.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  function answer(q: string): string {
    const lower = q.toLowerCase();
    if (!analysis) return "Load some transactions first so I can actually be useful instead of vague.";
    const food = analysis.byCategory.find((c) => c.category === "Food")?.amount ?? 0;
    const subs = analysis.byCategory.find((c) => c.category === "Subscriptions")?.amount ?? 0;
    const shop = analysis.byCategory.find((c) => c.category === "Shopping")?.amount ?? 0;
    const top = analysis.byCategory[0];
    const sav = analysis.recommendations.monthlySavings;

    if (lower.includes("save")) {
      return `Realistically, you could save **${formatINR(sav)}/month** (₹${analysis.recommendations.annualSavings.toLocaleString("en-IN")}/year) by doing one thing: **${analysis.recommendations.topAction}** Your biggest leak is ${top.category} at ${formatINR(top.amount)}.`;
    }
    if (lower.includes("overspend") || lower.includes("where am i")) {
      return `You're overspending on **${top.category}** (${formatINR(top.amount)}, ${(top.pct * 100).toFixed(0)}% of total). Food: ${formatINR(food)}, Subscriptions: ${formatINR(subs)}, Shopping: ${formatINR(shop)}. Cut even 30% of food spend and you'll see your health score jump.`;
    }
    if (lower.includes("afford") || lower.match(/\b\d/)) {
      const m = q.match(/(\d[\d,]*)/);
      const amt = m ? Number(m[1].replace(/,/g, "")) : 50000;
      const monthlyDisposable = Math.max(2000, sav * 2);
      const months = Math.ceil(amt / monthlyDisposable);
      return `For ${formatINR(amt)}: based on your habits, your disposable buffer is roughly ${formatINR(monthlyDisposable)}/mo. You'd need about **${months} month${months > 1 ? "s" : ""}** of disciplined saving — or cancel subscriptions to halve that.`;
    }
    if (lower.includes("budget")) {
      const total = analysis.total;
      return `Based on the last 60 days you're spending ~${formatINR(total / 2)}/month. A sane budget: Rent ~40%, Food ${formatINR(Math.min(8000, food * 0.6))}, Subscriptions ${formatINR(subs * 0.5)}, Shopping ${formatINR(shop * 0.7)}, Savings 20%.`;
    }
    if (lower.includes("score") || lower.includes("improve")) {
      return `Your Money Health Score is **${analysis.healthScore}/100**, Shame-O-Meter **${analysis.shameScore}/100** (${analysis.shameLevel}). To improve: ${analysis.recommendations.items.map((i) => `• ${i.title}`).join("  ")}. Estimated impact: +${analysis.recommendations.scoreImprovement} pts.`;
    }
    if (lower.includes("personality")) {
      return `Your spending personality is **${analysis.personality.name}** ${analysis.personality.icon}. ${analysis.personality.description} Tip: ${analysis.personality.tip}`;
    }
    return `I'd answer that better with more context, but based on your data: top category is ${top.category} at ${formatINR(top.amount)} (${(top.pct * 100).toFixed(0)}%). Try asking about saving, budgets, or affording a purchase.`;
  }

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: answer(q) }]);
      setThinking(false);
    }, 700);
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl grid place-items-center bg-[var(--gradient-primary)] shadow-glow">
            <Bot className="size-6 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">AI Financial Advisor</div>
            <h1 className="text-2xl font-bold tracking-tight">Talk to your money</h1>
          </div>
        </div>

        <Card className="glass-strong rounded-3xl p-4 sm:p-6">
          <div className="h-[480px] overflow-y-auto space-y-4 pr-2">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Sparkles className="size-4 animate-pulse text-primary" /> Consulting your transactions…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-card/70 border border-border/40 hover:border-primary/40 transition">
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="mt-3 flex gap-2"
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your spending…" className="bg-card/60" />
            <Button type="submit" className="bg-[var(--gradient-primary)] text-primary-foreground"><Send className="size-4" /></Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-primary text-primary-foreground text-sm whitespace-pre-wrap">{content}</div>
      </div>
    );
  }
  // simple bold render
  const html = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-xl grid place-items-center bg-[var(--gradient-primary)] shrink-0">
        <Bot className="size-4 text-primary-foreground" />
      </div>
      <div className="max-w-[85%] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
