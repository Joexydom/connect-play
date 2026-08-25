import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { VideoItem } from "@/lib/vibe-data";

export interface Playlist {
  id: string;
  title: string;
  description: string;
}

export interface PlaylistVideo {
  id: string;
  playlist_id: string;
  video_id: string;
  title: string;
  creator: string;
  thumb_url: string;
  position: number;
}

export function usePlaylists(userId: string | undefined) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [{ data: pl }, { data: pv }] = await Promise.all([
      supabase
        .from("playlists")
        .select("id, title, description")
        .order("created_at", { ascending: true }),
      supabase
        .from("playlist_videos")
        .select("id, playlist_id, video_id, title, creator, thumb_url, position")
        .order("position", { ascending: true }),
    ]);
    setPlaylists((pl ?? []) as Playlist[]);
    setVideos((pv ?? []) as PlaylistVideo[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createPlaylist = useCallback(
    async (title: string, description = "") => {
      if (!userId) return;
      const trimmed = title.trim();
      if (!trimmed) return;
      const { error } = await supabase
        .from("playlists")
        .insert({ user_id: userId, title: trimmed, description });
      if (error) {
        toast.error("Could not create playlist");
        return;
      }
      toast.success(`Playlist “${trimmed}” created`);
      await refresh();
    },
    [userId, refresh],
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      await supabase.from("playlists").delete().eq("id", id);
      await refresh();
    },
    [refresh],
  );

  const addVideo = useCallback(
    async (playlistId: string, video: VideoItem) => {
      if (!userId) return;
      const count = videos.filter((v) => v.playlist_id === playlistId).length;
      const { error } = await supabase.from("playlist_videos").insert({
        playlist_id: playlistId,
        user_id: userId,
        video_id: video.id,
        title: video.title,
        creator: video.creator,
        thumb_url: video.thumb,
        position: count,
      });
      if (error) {
        toast.error("Could not add video");
        return;
      }
      toast.success(`Added “${video.title}”`);
      await refresh();
    },
    [userId, videos, refresh],
  );

  const removeVideo = useCallback(
    async (id: string) => {
      await supabase.from("playlist_videos").delete().eq("id", id);
      await refresh();
    },
    [refresh],
  );

  return {
    playlists,
    videos,
    loading,
    createPlaylist,
    deletePlaylist,
    addVideo,
    removeVideo,
  };
}
