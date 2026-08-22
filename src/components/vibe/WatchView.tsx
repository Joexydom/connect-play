import { useEffect, useState } from "react";
import { Heart, Maximize2, Minimize2, Pause, Play, Share2, Video } from "lucide-react";
import { toast } from "sonner";
import { friends, videos } from "@/lib/vibe-data";
import { cn } from "@/lib/utils";

export function WatchView({
  theater,
  onToggleTheater,
  onStartCall,
}: {
  theater: boolean;
  onToggleTheater: () => void;
  onStartCall: () => void;
}) {
  const [currentId, setCurrentId] = useState(videos[0]?.id ?? "");
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(34);
  const [liked, setLiked] = useState(false);

  const video = videos.find((v) => v.id === currentId) ?? videos[0]!;
  const upNext = videos.filter((v) => v.id !== video.id);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(
      () => setProgress((p) => (p >= 100 ? 0 : p + 0.4)),
      400,
    );
    return () => window.clearInterval(id);
  }, [playing]);

  const selectVideo = (id: string) => {
    setCurrentId(id);
    setProgress(0);
    setPlaying(true);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* Header / Status Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/20 px-8">
        <h1 className="font-display text-lg font-bold tracking-tight uppercase">
          Late Night Chill • <span className="text-accent">{video.viewers} Watching</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast.success("Invite link copied — send it to your friends!")}
            className="cursor-pointer rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Invite Friends
          </button>
          <button
            type="button"
            onClick={() => toast("You're live! Friends can now join your stream.")}
            className="cursor-pointer rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
          >
            Go Live
          </button>
        </div>
      </header>

      {/* Stage */}
      <div className="relative flex min-h-0 flex-1 flex-col bg-black">
        <div className="flex w-full flex-1 items-center justify-center p-6">
          <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl shadow-primary/5 outline-1 -outline-offset-1 outline-white/5">
            <img
              src={video.thumb}
              alt={video.title}
              className={cn("h-full w-full object-cover", playing && "animate-kenburns")}
            />

            {/* Watching-with avatars */}
            <div className="absolute top-6 left-6 flex -space-x-3">
              {friends.slice(0, 3).map((f) => (
                <img
                  key={f.handle}
                  src={f.avatar}
                  alt={f.name}
                  className="size-10 rounded-full border-2 border-black object-cover"
                />
              ))}
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-black bg-primary text-xs font-bold text-primary-foreground">
                +8
              </div>
            </div>

            {/* Live badge */}
            <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-[10px] font-bold tracking-widest text-destructive-foreground uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-destructive-foreground" />
              Live
            </div>

            {/* Video Overlay Controls */}
            <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={() => setPlaying((p) => !p)}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                >
                  {playing ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="ml-0.5 size-4" />
                  )}
                </button>
                <div className="h-1 w-48 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-accent transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-white/60">{video.duration}</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onToggleTheater}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest text-white uppercase backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  {theater ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                  {theater ? "Exit Theater" : "Theater Mode"}
                </button>
                <button
                  type="button"
                  onClick={onStartCall}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold tracking-widest text-accent-foreground uppercase transition-opacity hover:opacity-90"
                >
                  <Video className="size-3.5" />
                  Start Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Info */}
        <div className="flex h-24 shrink-0 items-center justify-between border-t border-border/30 bg-card/30 px-12">
          <div className="flex items-center gap-4">
            <img
              src={video.creatorAvatar}
              alt={video.creator}
              className="size-12 rounded-xl object-cover outline-1 outline-border"
            />
            <div>
              <div className="font-bold">{video.title}</div>
              <div className="text-xs text-muted-foreground">
                Uploaded by {video.creator} • {video.posted}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setLiked((l) => !l)}
              className="cursor-pointer text-center"
            >
              <div className="flex items-center justify-center gap-1.5 font-display text-xl font-bold">
                <Heart
                  className={cn(
                    "size-4 transition-colors",
                    liked ? "fill-destructive text-destructive" : "text-muted-foreground",
                  )}
                />
                {liked ? "12k+" : "12k"}
              </div>
              <div className="text-[10px] tracking-tighter text-muted-foreground uppercase">
                Likes
              </div>
            </button>
            <button
              type="button"
              onClick={() => toast.success("Link copied — share this stream anywhere.")}
              className="cursor-pointer text-center"
            >
              <div className="flex items-center justify-center gap-1.5 font-display text-xl font-bold">
                <Share2 className="size-4 text-muted-foreground" />
                842
              </div>
              <div className="text-[10px] tracking-tighter text-muted-foreground uppercase">
                Shares
              </div>
            </button>
          </div>
        </div>

        {/* Up Next */}
        <div className="flex shrink-0 gap-4 overflow-x-auto border-t border-border/30 px-12 py-4 no-scrollbar">
          {upNext.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => selectVideo(v.id)}
              className="group w-52 shrink-0 cursor-pointer text-left"
            >
              <div className="relative overflow-hidden rounded-xl outline-1 -outline-offset-1 outline-white/5">
                <img
                  src={v.thumb}
                  alt={v.title}
                  loading="lazy"
                  className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {v.duration}
                </span>
              </div>
              <div className="mt-2 line-clamp-1 text-sm font-semibold">{v.title}</div>
              <div className="text-xs text-muted-foreground">
                {v.creator} • {v.viewers} watching
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
