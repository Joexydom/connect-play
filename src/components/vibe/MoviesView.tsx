import { useState } from "react";
import type { FormEvent } from "react";
import { Film, Loader2, Play, Search, Users } from "lucide-react";
import { toast } from "sonner";

interface Movie {
  id: number;
  title: string;
  year: string;
  genre: string;
  poster: string;
  preview?: string;
  overview: string;
}

const SUGGESTIONS = ["Dune", "Inception", "Spider-Man", "Interstellar", "Barbie", "Oppenheimer"];

async function searchMovies(term: string): Promise<Movie[]> {
  const res = await fetch(
    `https://itunes.apple.com/search?media=movie&limit=24&term=${encodeURIComponent(term)}`,
  );
  if (!res.ok) throw new Error("search failed");
  const json = (await res.json()) as { results: Record<string, unknown>[] };
  return json.results.map((r) => ({
    id: Number(r["trackId"]),
    title: String(r["trackName"] ?? "Untitled"),
    year: String(r["releaseDate"] ?? "").slice(0, 4),
    genre: String(r["primaryGenreName"] ?? "Film"),
    poster: String(r["artworkUrl100"] ?? "").replace("100x100bb", "600x600bb"),
    preview: r["previewUrl"] ? String(r["previewUrl"]) : undefined,
    overview: String(r["longDescription"] ?? r["shortDescription"] ?? ""),
  }));
}

export function MoviesView({ onStartCall }: { onStartCall: () => void }) {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);

  const run = async (q: string) => {
    const query = q.trim();
    if (!query) return;
    setTerm(query);
    setLoading(true);
    setSearched(true);
    try {
      const movies = await searchMovies(query);
      setResults(movies);
      setSelected(movies[0] ?? null);
    } catch {
      toast.error("Couldn't reach the movie library. Try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void run(term);
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <div className="border-b border-border/50 px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Find a movie</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search thousands of films, then start a watch party with your crew.
        </p>

        <form onSubmit={submit} className="relative mt-5 max-w-xl">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            type="text"
            placeholder="Search movies by title..."
            aria-label="Search movies"
            className="w-full rounded-xl border border-input bg-secondary/50 py-3 pr-24 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-bold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void run(s)}
              className="cursor-pointer rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" />
          Searching...
        </div>
      ) : !searched ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/50">
            <Film className="size-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Search a title above to browse movies you can watch together.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
          No movies matched that search.
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-8 p-8 xl:flex-row">
          {selected ? (
            <div className="w-full shrink-0 xl:w-80">
              <div className="overflow-hidden rounded-2xl border border-border bg-card/40">
                <img
                  src={selected.poster}
                  alt={selected.title}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="font-display text-lg font-bold tracking-tight">
                    {selected.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.year} · {selected.genre}
                  </p>
                  {selected.overview ? (
                    <p className="mt-3 line-clamp-5 text-xs leading-relaxed text-muted-foreground">
                      {selected.overview}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-col gap-2">
                    {selected.preview ? (
                      <a
                        href={selected.preview}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-bold tracking-widest text-accent-foreground uppercase transition-opacity hover:opacity-90"
                      >
                        <Play className="size-4" />
                        Play trailer
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        toast.success(`Watch party invite sent for ${selected.title}`);
                        onStartCall();
                      }}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold tracking-widest text-primary-foreground uppercase transition-opacity hover:opacity-90"
                    >
                      <Users className="size-4" />
                      Watch with friends
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 self-start sm:grid-cols-3 2xl:grid-cols-4">
            {results.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m)}
                className="group cursor-pointer text-left"
              >
                <div className="overflow-hidden rounded-xl ring-1 ring-border transition-transform group-hover:scale-[1.02]">
                  <img
                    src={m.poster}
                    alt={m.title}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <div className="mt-2 truncate text-sm font-semibold">{m.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {m.year} · {m.genre}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
