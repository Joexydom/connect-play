import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/lib/vibe-data";

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
}

interface Row {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Loads the shared chat rooms. */
export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_rooms")
        .select("id, name, description")
        .order("created_at", { ascending: true });
      if (!cancelled && data) setRooms(data as ChatRoom[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return rooms;
}

/**
 * Live messages for a room. New messages from anyone arrive over realtime,
 * so two signed-in users see each other's messages instantly.
 */
export function useRoomMessages(roomId: string | undefined, currentUserId: string) {
  const [rows, setRows] = useState<Row[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});

  const loadAuthors = useCallback(async (ids: string[]) => {
    const missing = ids.filter((id) => id);
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
  }, []);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    setRows([]);

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, room_id, user_id, content, created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled || !data) return;
      setRows(data as Row[]);
      void loadAuthors([...new Set(data.map((d) => d.user_id))]);
    })();

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as Row;
          setRows((prev) => (prev.some((r) => r.id === row.id) ? prev : [...prev, row]));
          void loadAuthors([row.user_id]);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [roomId, loadAuthors]);

  const messages: ChatMessage[] = rows.map((r) => ({
    id: r.id,
    author: r.user_id === currentUserId ? "you" : (authors[r.user_id] ?? "Someone"),
    text: r.content,
    tone: r.user_id === currentUserId ? "self" : "primary",
    time: formatTime(r.created_at),
  }));

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !roomId) return;
      await supabase
        .from("messages")
        .insert({ room_id: roomId, user_id: currentUserId, content: trimmed });
    },
    [roomId, currentUserId],
  );

  return { messages, send };
}
