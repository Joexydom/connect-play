import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface MovieResult {
  id: number;
  title: string;
  year: string;
  genre: string;
  poster: string;
  link: string;
  overview: string;
}

interface WikiPage {
  pageid: number;
  title: string;
  index?: number;
  extract?: string;
  thumbnail?: { source: string };
}

export const searchMovies = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ term: z.string() }).parse(data))
  .handler(async ({ data }): Promise<MovieResult[]> => {
    const term = data.term.trim();
    if (!term) return [];
    const url =
      "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*" +
      "&generator=search&gsrlimit=20&prop=pageimages|extracts" +
      "&piprop=thumbnail&pithumbsize=500&exintro=1&explaintext=1" +
      `&gsrsearch=${encodeURIComponent(`${term} film`)}`;

    const res = await fetch(url, { headers: { "User-Agent": "VibeApp/1.0" } });
    if (!res.ok) throw new Error("Movie search failed");
    const json = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
    const pages = Object.values(json.query?.pages ?? {});

    return pages
      .sort((a, b) => (a.index ?? 99) - (b.index ?? 99))
      .map((p) => {
        const extract = p.extract ?? "";
        const yearMatch = /\b(19|20)\d{2}\b/.exec(extract);
        return {
          id: p.pageid,
          title: p.title,
          year: yearMatch ? yearMatch[0] : "",
          genre: /series|television/i.test(extract) ? "Series" : "Film",
          poster: p.thumbnail?.source ?? "",
          link: `https://en.wikipedia.org/?curid=${p.pageid}`,
          overview: extract.slice(0, 400),
        };
      })
      .filter((m) => m.overview.length > 0);
  });
