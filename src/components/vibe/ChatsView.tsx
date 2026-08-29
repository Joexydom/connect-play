import { useEffect, useState } from "react";
import { Phone, Search, Video } from "lucide-react";
import { friends } from "@/lib/vibe-data";
import { usePrivateConversations } from "@/hooks/use-private-conversations";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

export function ChatsView({
  onStartCall,
  userId,
}: {
  onStartCall: () => void;
  userId: string;
}) {
  const { conversations } = usePrivateConversations(userId);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0]!.id);
    }
  }, [conversations, activeId]);

  const { messages, send } = usePrivateMessages(
    activeId,
    userId,
    active?.other_user_name ?? ""
  );

  return (
    <>
      {/* Conversation list */}
      <div className="flex w-80 shrink-0 flex-col border-r border-border bg-background">
        <div className="px-6 pt-6 pb-4">
          <h2 className="font-display text-lg font-bold tracking-tight">Messages</h2>
        </div>
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full rounded-xl bg-secondary/50 py-2.5 pr-4 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No conversations yet. Start one with a friend!
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex w-full cursor-pointer gap-4 rounded-2xl p-3 text-left transition-colors",
                  activeId === c.id ? "bg-secondary/80" : "hover:bg-secondary/40",
                )}
              >
                <div className="relative shrink-0">
                  <img
                    src={c.other_user_avatar}
                    alt={c.other_user_name}
                    className="size-12 rounded-full object-cover"
                  />
                  {c.other_user_online ? (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-accent" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold">{c.other_user_name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.last_message_time}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{c.last_message}</p>
                </div>
                {c.unread_count > 0 ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {c.unread_count}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Active conversation thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Thread header */}
        {active ? (
          <>
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-8">
              <div className="flex items-center gap-4">
                <img
                  src={active.other_user_avatar}
                  alt={active.other_user_name}
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold">{active.other_user_name}</div>
                  <div className="text-xs text-accent">
                    {active.other_user_online ? "Active now" : "Offline"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onStartCall}
                  className="cursor-pointer rounded-full bg-secondary/50 p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Voice call"
                >
                  <Phone className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={onStartCall}
                  className="cursor-pointer rounded-full bg-secondary/50 p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Video call"
                >
                  <Video className="size-5" />
                </button>
              </div>
            </div>

            <ChatPanel
              title="Chat"
              wide
              showHeader={false}
              messages={messages}
              typing={false}
              typingAuthor=""
              onSend={(t) => void send(t)}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </>
  );
}

export function FriendsList() {
  return (
    <div className="w-80 shrink-0 border-r border-border bg-background p-6">
      <h2 className="font-display text-lg font-bold tracking-tight">Friends</h2>
      <div className="mt-6 space-y-4">
        {friends.map((f) => (
          <div key={f.handle} className="flex items-center gap-3">
            <div className="relative">
              <img src={f.avatar} alt={f.name} className="size-10 rounded-full object-cover" />
              {f.online ? (
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-accent" />
              ) : null}
            </div>
            <div>
              <div className="text-sm font-semibold">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.handle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
