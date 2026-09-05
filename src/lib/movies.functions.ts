import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface MovieResult {
  id: number;
  title: string;
  year: string;
  genre: string;
  poster: string;
  preview: string;
  overview: string;
}

export const searchMovies = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ term: z.string() }).parse(data))
  .handler(async ({ data }): Promise<MovieResult[]> => {
    const term = data.term.trim();
    if (!term) return [];
    const res = await fetch(
      `https://itunes.apple.com/search?media=movie&limit=24&term=${encodeURIComponent(term)}`,
    );
    if (!res.ok) throw new Error("Movie search failed");
    const json = (await res.json()) as { results?: Record<string, unknown>[] };
    return (json.results ?? []).map((r) => ({
      id: Number(r["trackId"] ?? Math.random() * 1e9),
      title: String(r["trackName"] ?? "Untitled"),
      year: String(r["releaseDate"] ?? "").slice(0, 4),
      genre: String(r["primaryGenreName"] ?? "Film"),
      poster: String(r["artworkUrl100"] ?? "").replace("100x100bb", "600x600bb"),
      preview: String(r["previewUrl"] ?? ""),
      overview: String(r["longDescription"] ?? r["shortDescription"] ?? ""),
    }));
  });
