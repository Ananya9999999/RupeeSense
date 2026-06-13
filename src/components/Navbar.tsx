import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Wallet, LayoutDashboard, History, Sparkles, Trophy, Bot, Settings as SettingsIcon, LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/advisor", label: "AI Advisor", icon: Bot },
] as const;

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="size-9 rounded-xl grid place-items-center bg-[var(--gradient-primary)] shadow-glow">
            <Wallet className="size-5 text-primary-foreground" />
          </div>
          <div className="font-semibold tracking-tight text-lg">
            Rupee<span className="text-gradient">Sense</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  active ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-card/70 transition">
                <div
                  className="size-8 rounded-full grid place-items-center text-sm font-semibold text-primary-foreground"
                  style={{ background: `linear-gradient(135deg, ${user.avatarColor}, #14B8A6)` }}
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                  <UserRound className="size-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                  <SettingsIcon className="size-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    navigate({ to: "/auth" });
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* mobile nav */}
      <nav className="md:hidden flex overflow-x-auto gap-1 px-3 pb-2">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
                active ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-3.5" /> {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
