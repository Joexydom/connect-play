import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChatMessage } from "@/lib/vibe-data";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { cn } from "@/lib/utils";

export function ChatPanel({
  title,
  messages,
  typing,
  typingAuthor,
  onSend,
  wide = false,
  showHeader = true,
}: {
  title: string;
  messages: ChatMessage[];
  typing: boolean;
  typingAuthor: string;
  onSend: (text: string) => void;
  wide?: boolean;
  showHeader?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSend(draft);
    setDraft("");
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-l border-border bg-card/20",
        wide ? "w-full" : "w-80",
      )}
    >
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="font-display font-bold tracking-wide uppercase">{title}</h2>
          <div className="size-2 animate-pulse rounded-full bg-accent" />
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {typing ? <TypingIndicator author={typingAuthor} /> : null}
      </div>

      <div className="p-6">
        <form onSubmit={submit} className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            type="text"
            placeholder="Type a message..."
            aria-label="Type a message"
            className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 pr-16 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-primary"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            SEND
          </button>
        </form>
      </div>
    </aside>
  );
}
