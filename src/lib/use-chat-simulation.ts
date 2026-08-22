import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, MessageTone } from "./vibe-data";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Local chat state with a simulated friend replying shortly after you send.
 * Resets whenever `key` changes (e.g. switching conversations).
 */
export function useChatSimulation(
  key: string,
  initial: ChatMessage[],
  replies: string[],
  replier: { author: string; tone: MessageTone },
) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [typing, setTyping] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMessages(initial);
    setTyping(false);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const time = nowTime();
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), author: "you", text: trimmed, tone: "self", time },
      ]);
      setTyping(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => {
          setTyping(false);
          const reply = replies[Math.floor(Math.random() * replies.length)];
          setMessages((m) => [
            ...m,
            {
              id: crypto.randomUUID(),
              author: replier.author,
              text: reply,
              tone: replier.tone,
              time: nowTime(),
            },
          ]);
        },
        1400 + Math.random() * 1200,
      );
    },
    [replies, replier],
  );

  return { messages, typing, send };
}
