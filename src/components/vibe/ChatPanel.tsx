import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Smile } from "lucide-react";
import type { ChatMessage } from "@/lib/vibe-data";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { cn } from "@/lib/utils";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: ["😀", "😂", "🤣", "😊", "😍", "😘", "😎", "🤩", "😜", "🤔", "😴", "🥳", "😭", "😡", "🤯", "🙌"],
  },
  {
    label: "Gestures",
    emojis: ["👍", "👎", "👏", "🙏", "💪", "🤝", "✌️", "🤙", "👋", "🫶", "❤️", "🔥"],
  },
  {
    label: "Fun",
    emojis: ["🎬", "🍿", "🎮", "🎧", "🎵", "⚽", "🍕", "☕", "🎉", "💯", "👀", "✨"],
  },
];

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
  const [emojiOpen, setEmojiOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [emojiOpen]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSend(draft);
    setDraft("");
    setEmojiOpen(false);
  };

  const addEmoji = (emoji: string) => {
    setDraft((d) => d + emoji);
    inputRef.current?.focus();
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
        <div ref={pickerRef} className="relative">
          {emojiOpen && (
            <div className="absolute right-0 bottom-full z-50 mb-2 w-72 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
              {EMOJI_GROUPS.map((group) => (
                <div key={group.label} className="mb-2 last:mb-0">
                  <div className="mb-1 px-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-8 gap-0.5">
                    {group.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        aria-label={`Insert ${emoji}`}
                        onClick={() => addEmoji(emoji)}
                        className="cursor-pointer rounded-lg p-1 text-lg transition-colors hover:bg-secondary"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="relative">
            <button
              type="button"
              title="Add emoji"
              aria-label="Add emoji"
              onClick={() => setEmojiOpen((o) => !o)}
              className={cn(
                "absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer transition-colors",
                emojiOpen ? "text-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Smile className="size-4.5" />
            </button>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              type="text"
              placeholder="Type a message..."
              aria-label="Type a message"
              className="w-full rounded-xl border border-input bg-secondary/50 py-3 pr-16 pl-10 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-primary"
            />
            <button
              type="submit"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              SEND
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
