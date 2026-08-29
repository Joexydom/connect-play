import { useEffect, useState } from "react";
import { Hash, Phone, Video } from "lucide-react";
import { useChatRooms, useRoomMessages } from "@/hooks/use-realtime-chat";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

export function RoomsChatView({
  userId,
  onStartCall,
}: {
  userId: string;
  onStartCall: () => void;
}) {
  const rooms = useChatRooms();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!activeId && rooms.length > 0) setActiveId(rooms[0]!.id);
  }, [rooms, activeId]);

  const active = rooms.find((r) => r.id === activeId);
  const { messages, send } = useRoomMessages(activeId, userId);

  return (
    <>
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-background">
        <div className="px-6 pt-6 pb-4">
          <h2 className="font-display text-lg font-bold tracking-tight">Rooms</h2>
          <p className="mt-1 text-xs text-muted-foreground">Live chat with everyone on Vibe</p>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {rooms.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveId(r.id)}
              className={cn(
                "flex w-full cursor-pointer items-start gap-3 rounded-2xl p-3 text-left transition-colors",
                activeId === r.id ? "bg-secondary/80" : "hover:bg-secondary/40",
              )}
            >
              <Hash className="mt-0.5 size-4 shrink-0 text-accent" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{r.name}</div>
                <div className="truncate text-xs text-muted-foreground">{r.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-8">
          <div>
            <div className="font-bold">{active ? `#${active.name}` : "Loading…"}</div>
            <div className="text-xs text-accent">Live · messages sync instantly</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStartCall}
              aria-label="Voice call"
              className="cursor-pointer rounded-full bg-secondary/50 p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Phone className="size-5" />
            </button>
            <button
              type="button"
              onClick={onStartCall}
              aria-label="Video call"
              className="cursor-pointer rounded-full bg-secondary/50 p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Video className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <ChatPanel
            title="Chat"
            wide
            showHeader={false}
            messages={messages}
            typing={false}
            typingAuthor=""
            onSend={(t) => void send(t)}
          />
        </div>
      </div>
    </>
  );
}
