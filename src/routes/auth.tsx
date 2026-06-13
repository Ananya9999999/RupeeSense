import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, ArrowRight, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        if (!email || !password) throw new Error("Email and password required");
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        if (!name || !email || password.length < 6) throw new Error("Name, valid email, password ≥ 6 chars");
        await signUp(name, email, password);
        toast.success("Account created");
        navigate({ to: "/dashboard" });
      } else {
        toast.success(`If ${email} exists, a reset link was sent.`);
        setMode("signin");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl grid place-items-center bg-[var(--gradient-primary)] shadow-glow">
            <Wallet className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Rupee<span className="text-gradient">Sense</span></span>
        </div>
        <div className="space-y-6 relative z-10">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight">
            Your AI <span className="text-gradient">Financial Mirror</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Get roasted for your Swiggy habit. Calmly, mathematically, by an AI that loves you more than your bank does.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { k: "Money Health Score", v: "0–100" },
              { k: "Shame-O-Meter", v: "Brutal" },
              { k: "Future Self", v: "Projected" },
              { k: "AI Advisor", v: "Always on" },
            ].map((f) => (
              <div key={f.k} className="glass rounded-2xl p-4">
                <div className="text-xs text-muted-foreground">{f.k}</div>
                <div className="text-sm font-semibold mt-1">{f.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground relative z-10">
          Built for ArcNight 2026 • Microsoft Innovations Club • VIT Chennai
        </div>
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[var(--gradient-primary)] opacity-20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md glass-strong rounded-3xl p-8">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="size-9 rounded-xl grid place-items-center bg-[var(--gradient-primary)]">
              <Wallet className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Rupee<span className="text-gradient">Sense</span></span>
          </div>

          {mode !== "forgot" ? (
            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mb-6">
              <TabsList className="w-full bg-card/60">
                <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" />
              <TabsContent value="signup" />
            </Tabs>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Reset your password</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll send you a link to set a new one.</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <UserIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Arjun Sharma" className="pl-9" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@rupee.in" className="pl-9" />
              </div>
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
                </div>
              </div>
            )}

            <Button disabled={busy} type="submit" className="w-full h-11 bg-[var(--gradient-primary)] text-primary-foreground hover:opacity-90 shadow-glow">
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "signup" ? "Create account" : "Send reset link"}
              <ArrowRight className="size-4 ml-2" />
            </Button>

            {mode === "forgot" && (
              <button type="button" onClick={() => setMode("signin")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                Back to sign in
              </button>
            )}
          </form>

          <div className="mt-6 text-xs text-muted-foreground text-center">
            Demo mode — no real credentials are stored on a server.
          </div>
        </div>
      </div>
    </div>
  );
}
