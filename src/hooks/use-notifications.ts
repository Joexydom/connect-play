import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

const SELECT = "id, kind, title, body, read_at, created_at";

/** Live notification feed for the signed-in user. */
export function useNotifications(userId: string | undefined) {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select(SELECT)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled && data) setItems(data as Notification[]);
    })();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Notification;
          setItems((prev) => (prev.some((n) => n.id === row.id) ? prev : [row, ...prev]));
          toast(row.title, { description: row.body });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unread = items.filter((n) => !n.read_at).length;

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", userId)
      .is("read_at", null);
  }, [userId]);

  const dismiss = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  }, []);

  return { items, unread, markAllRead, dismiss };
}
