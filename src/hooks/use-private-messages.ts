import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/lib/vibe-data";

interface PrivateMessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Loads private messages for a conversation with real-time updates. */
export function usePrivateMessages(
  conversationId: string | undefined,
  currentUserId: string,
  otherUserName: string
) {
  const [rows, setRows] = useState<PrivateMessageRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});

  const loadAuthors = useCallback(
    async (ids: string[]) => {
      const missing = ids.filter((id) => id && !authors[id]);
      if (missing.length === 0) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, username")
        .in("id", missing);
      if (!data) return;
      setAuthors((prev) => {
        const next = { ...prev };
        for (const p of data) next[p.id] = p.display_name || p.username || "Someone";
        return next;
      });
    },
    [authors]
  );

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setRows([]);

    (async () => {
      const { data } = await supabase
        .from("private_messages")
        .select("id, conversation_id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled || !data) return;
      setRows(data as PrivateMessageRow[]);
      void loadAuthors([...new Set(data.map((d) => d.sender_id))]);
    })();

    const channel = supabase
      .channel(`private-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as PrivateMessageRow;
          setRows((prev) => (prev.some((r) => r.id === row.id) ? prev : [...prev, row]));
          void loadAuthors([row.sender_id]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId, loadAuthors]);

  const messages: ChatMessage[] = rows.map((r) => ({
    id: r.id,
    author: r.sender_id === currentUserId ? "you" : (authors[r.sender_id] ?? otherUserName ?? "Someone"),
    text: r.content,
    tone: r.sender_id === currentUserId ? "self" : "primary",
    time: formatTime(r.created_at),
  }));

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !conversationId) return;
      await supabase
        .from("private_messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, content: trimmed });
    },
    [conversationId, currentUserId]
  );

  return { messages, send };
}
