import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ListMusic, Plus, Trash2, X } from "lucide-react";
import { usePlaylists } from "@/hooks/use-playlists";
import { videos as library } from "@/lib/vibe-data";
import { cn } from "@/lib/utils";

export function PlaylistsView({ userId }: { userId: string }) {
  const { playlists, videos, loading, createPlaylist, deletePlaylist, addVideo, removeVideo } =
    usePlaylists(userId);
  const [title, setTitle] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (playlists.length === 0) {
      setActiveId(undefined);
      return;
    }
    if (!activeId || !playlists.some((p) => p.id === activeId)) setActiveId(playlists[0]!.id);
  }, [playlists, activeId]);

  const active = playlists.find((p) => p.id === activeId);
  const items = videos.filter((v) => v.playlist_id === activeId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void createPlaylist(title);
    setTitle("");
  };

  return (
    <>
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-background">
        <div className="px-6 pt-6 pb-4">
          <h2 className="font-display text-lg font-bold tracking-tight">Playlists</h2>
          <p className="mt-1 text-xs text-muted-foreground">Queue up what you watch together</p>
        </div>

        <form onSubmit={submit} className="px-6 pb-4">
          <div className="relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New playlist name"
              aria-label="New playlist name"
              className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2.5 pr-10 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Create playlist"
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-lg bg-primary p-1.5 text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </form>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {loading ? <p className="px-3 text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && playlists.length === 0 ? (
            <p className="px-3 text-sm text-muted-foreground">
              No playlists yet — create your first one above.
            </p>
          ) : null}
          {playlists.map((p) => (
            <div
              key={p.id}
              className={cn(
                "group flex items-center gap-2 rounded-2xl p-3 transition-colors",
                activeId === p.id ? "bg-secondary/80" : "hover:bg-secondary/40",
              )}
            >
              <button
                type="button"
                onClick={() => setActiveId(p.id)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
              >
                <ListMusic className="size-4 shrink-0 text-accent" />
                <span className="truncate text-sm font-semibold">{p.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {videos.filter((v) => v.playlist_id === p.id).length}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${p.title}`}
                onClick={() => void deletePlaylist(p.id)}
                className="cursor-pointer text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex h-16 items-center border-b border-border/50 px-8">
          <h1 className="font-display text-lg font-bold tracking-tight uppercase">
            {active ? active.title : "Your playlists"}
          </h1>
        </header>

        <div className="p-8">
          {!active ? (
            <p className="text-sm text-muted-foreground">
              Create a playlist to start saving videos.
            </p>
          ) : (
            <>
              <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                In this playlist
              </h2>
              {items.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing here yet — add videos from the library below.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {items.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center gap-4 rounded-2xl bg-card/40 p-3 outline-1 -outline-offset-1 outline-border"
                    >
                      <img
                        src={v.thumb_url}
                        alt={v.title}
                        className="h-16 w-28 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{v.title}</div>
                        <div className="text-xs text-muted-foreground">{v.creator}</div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${v.title}`}
                        onClick={() => void removeVideo(v.id)}
                        className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <h2 className="mt-10 text-sm font-bold tracking-widest text-muted-foreground uppercase">
                Add from library
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {library.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => void addVideo(active.id, v)}
                    className="group cursor-pointer overflow-hidden rounded-2xl bg-card/40 text-left outline-1 -outline-offset-1 outline-border transition-colors hover:outline-primary"
                  >
                    <img
                      src={v.thumb}
                      alt={v.title}
                      className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="p-4">
                      <div className="truncate font-semibold">{v.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.creator} · {v.duration}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
