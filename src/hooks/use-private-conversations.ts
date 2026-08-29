import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PrivateConversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string;
  other_user_online: boolean;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

/** Loads private conversations for the current user. */
export function usePrivateConversations(currentUserId: string) {
  const [conversations, setConversations] = useState<PrivateConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const { data: convos, error } = await supabase
      .from("private_conversations")
      .select("id, user_1_id, user_2_id, updated_at")
      .or(`user_1_id.eq.${currentUserId},user_2_id.eq.${currentUserId}`)
      .order("updated_at", { ascending: false });

    if (error || !convos) {
      console.error("Error loading conversations:", error);
      setLoading(false);
      return;
    }

    // Get the other user IDs
    const otherUserIds = convos.map((c) =>
      c.user_1_id === currentUserId ? c.user_2_id : c.user_1_id
    );

    // Fetch other users' profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, last_seen")
      .in("id", otherUserIds);

    if (profileError || !profiles) {
      console.error("Error loading profiles:", profileError);
      setLoading(false);
      return;
    }

    const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

    // Fetch last message for each conversation
    const { data: lastMessages, error: messagesError } = await supabase
      .from("private_messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", convos.map((c) => c.id))
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("Error loading messages:", messagesError);
    }

    const messageMap: Record<string, { content: string; created_at: string }> = {};
    if (lastMessages) {
      lastMessages.forEach((m) => {
        if (!messageMap[m.conversation_id]) {
          messageMap[m.conversation_id] = {
            content: m.content,
            created_at: m.created_at,
          };
        }
      });
    }

    // Build conversation list with user info and last message
    const conversationList: PrivateConversation[] = convos.map((c) => {
      const otherUserId = c.user_1_id === currentUserId ? c.user_2_id : c.user_1_id;
      const otherUser = profileMap[otherUserId] || {
        display_name: "Unknown",
        username: "user",
        avatar_url: "",
      };
      const lastMsg = messageMap[c.id];

      return {
        id: c.id,
        other_user_id: otherUserId,
        other_user_name: otherUser.display_name || otherUser.username || "Someone",
        other_user_avatar: otherUser.avatar_url || "",
        other_user_online: otherUser.last_seen
          ? new Date(otherUser.last_seen).getTime() > Date.now() - 5 * 60 * 1000
          : false,
        last_message: lastMsg?.content || "",
        last_message_time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        unread_count: 0, // TODO: Implement unread tracking
      };
    });

    setConversations(conversationList);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  return { conversations, loading };
}
