import type { ChatMessage } from "@/lib/vibe-data";
import { cn } from "@/lib/utils";

const authorToneClass: Record<string, string> = {
  primary: "text-primary",
  accent: "text-accent",
  muted: "text-muted-foreground",
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.tone === "system") {
    return (
      <p className="text-center text-sm text-muted-foreground italic">{message.text}</p>
    );
  }

  const isSelf = message.tone === "self";

  return (
    <div className={cn("flex flex-col gap-1", isSelf && "items-end")}>
      <span
        className={cn(
          "text-xs font-bold",
          isSelf ? "text-accent" : (authorToneClass[message.tone] ?? "text-primary"),
        )}
      >
        {message.author}
        <span className="ml-2 font-normal text-muted-foreground/60">{message.time}</span>
      </span>
      <p
        className={cn(
          "max-w-[85%] p-3 text-sm",
          isSelf
            ? "rounded-2xl rounded-tr-none bg-primary/20 text-foreground"
            : "rounded-2xl rounded-tl-none bg-secondary/50 text-muted-foreground",
        )}
      >
        {message.text}
      </p>
    </div>
  );
}

export function TypingIndicator({ author }: { author: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-accent">{author}</span>
      <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-none bg-secondary/50 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot size-1.5 rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
