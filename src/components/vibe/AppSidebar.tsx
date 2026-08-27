import { Bell, ListMusic, LogOut, MessagesSquare, MonitorPlay, Phone } from "lucide-react";
import type { Profile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

export type View = "watch" | "chats" | "playlists" | "calls";

const navItems: { id: View; label: string; icon: typeof MonitorPlay }[] = [
  { id: "watch", label: "Watch", icon: MonitorPlay },
  { id: "chats", label: "Chats", icon: MessagesSquare },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "calls", label: "Calls", icon: Phone },
];

export function AppSidebar({
  active,
  onChange,
  user,
  onSignOut,
  unread,
  onToggleNotifications,
  notificationsOpen,
}: {
  active: View;
  onChange: (view: View) => void;
  user: Profile | null;
  onSignOut: () => void;
  unread: number;
  onToggleNotifications: () => void;
  notificationsOpen: boolean;
}) {
  return (
    <nav className="flex w-20 shrink-0 flex-col items-center gap-10 border-r border-border bg-background/50 py-8">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent font-display text-xl font-bold tracking-tighter text-background">
        V
      </div>

      <div className="flex flex-col gap-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative cursor-pointer rounded-xl p-3 transition-colors",
              active === item.id
                ? "bg-secondary text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="size-6" />
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-6">
        <button
          type="button"
          title="Notifications"
          aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
          onClick={onToggleNotifications}
          className={cn(
            "relative cursor-pointer rounded-xl p-3 transition-colors",
            notificationsOpen
              ? "bg-secondary text-accent"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          onClick={onSignOut}
          className="cursor-pointer rounded-xl p-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-5" />
        </button>
        <div
          title={user ? `${user.display_name} (@${user.username})` : "Your account"}
          className="flex size-10 items-center justify-center rounded-full text-sm font-bold text-background outline-2 outline-offset-2 outline-primary/30"
          style={{ backgroundColor: user?.avatar_color ?? "#7C5CFF" }}
        >
          {(user?.display_name ?? "…").slice(0, 1).toUpperCase()}
        </div>
      </div>
    </nav>
  );
}
