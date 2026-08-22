import { MessagesSquare, MonitorPlay, Phone, Settings } from "lucide-react";
import { friends } from "@/lib/vibe-data";
import { cn } from "@/lib/utils";

export type View = "watch" | "chats" | "calls";

const navItems: { id: View; label: string; icon: typeof MonitorPlay; badge?: number }[] = [
  { id: "watch", label: "Watch", icon: MonitorPlay },
  { id: "chats", label: "Chats", icon: MessagesSquare, badge: 4 },
  { id: "calls", label: "Calls", icon: Phone },
];

export function AppSidebar({
  active,
  onChange,
}: {
  active: View;
  onChange: (view: View) => void;
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
              "relative rounded-xl p-3 transition-colors",
              active === item.id
                ? "bg-secondary text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="size-6" />
            {item.badge ? (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-6">
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          className="rounded-xl p-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings className="size-5" />
        </button>
        <img
          src={friends[0]?.avatar}
          alt="Your profile"
          className="size-10 rounded-full object-cover outline-2 outline-offset-2 outline-primary/30"
        />
      </div>
    </nav>
  );
}
