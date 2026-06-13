import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const { clear, transactions } = useData();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-1">Settings</div>
          <h1 className="text-3xl font-bold tracking-tight">Profile & data</h1>
        </div>

        <Card className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl grid place-items-center text-2xl font-bold text-primary-foreground"
              style={{ background: `linear-gradient(135deg, ${user?.avatarColor}, #14B8A6)` }}>
              {user?.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={() => { updateProfile({ name, email }); toast.success("Profile updated"); }}
            className="bg-[var(--gradient-primary)] text-primary-foreground"
          >Save changes</Button>
        </Card>

        <Card className="glass rounded-3xl p-6">
          <div className="font-semibold">Data</div>
          <div className="text-sm text-muted-foreground mt-1">You have {transactions.length} transactions stored locally.</div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => { clear(); toast.success("Cleared"); }}>Clear all transactions</Button>
            <Button variant="destructive" onClick={() => { signOut(); navigate({ to: "/auth" }); }}>Log out</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
