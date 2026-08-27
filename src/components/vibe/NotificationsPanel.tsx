import { Bell, Check, X } from "lucide-react";
import type { Notification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsPanel({
  items,
  unread,
  onMarkAllRead,
  onDismiss,
  onClose,
}: {
  items: Notification[];
  unread: number;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-6 left-24 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-accent" />
          <span className="font-display text-sm font-bold tracking-tight">Notifications</span>
          {unread > 0 ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Mark all read"
            onClick={onMarkAllRead}
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            You're all caught up.
          </p>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={cn(
                "group flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-0",
                !n.read_at && "bg-secondary/40",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.read_at ? "bg-muted" : "bg-accent",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{n.title}</div>
                {n.body ? (
                  <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                ) : null}
                <div className="mt-1 text-[10px] text-muted-foreground/70">
                  {timeAgo(n.created_at)}
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(n.id)}
                className="cursor-pointer text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
