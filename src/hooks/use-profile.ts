import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  avatar_color: string;
}

const AVATAR_COLORS = ["#7C5CFF", "#22D3EE", "#F472B6", "#34D399", "#FBBF24", "#FB7185"];

function pickColor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function metadataString(user: User, key: string): string {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Loads the signed-in user's profile, creating one on first sign-in. */
export function useProfile(user: User | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, avatar_color")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (data) {
        setProfile(data as Profile);
        return;
      }

      const emailName = user.email?.split("@")[0] ?? "viber";
      const displayName =
        metadataString(user, "display_name") || metadataString(user, "full_name") || emailName;
      const username =
        (metadataString(user, "username") || emailName)
          .toLowerCase()
          .replace(/[^a-z0-9_.]/g, "")
          .slice(0, 24) || "viber";

      const { data: created } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            display_name: displayName,
            username,
            avatar_url: metadataString(user, "avatar_url") || null,
            avatar_color: pickColor(user.id),
          },
          { onConflict: "id" },
        )
        .select("id, display_name, username, avatar_url, avatar_color")
        .single();

      if (!cancelled && created) setProfile(created as Profile);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return profile;
}
