import type { Context } from "@netlify/functions";
import { fetchListeningData } from "../../lib/lastfm.ts";

export type { NowPlayingTrack, RecentTrack, TopArtist, TopAlbum, ListeningResponse } from "../../lib/lastfm.ts";
export { parseRecentTracks, parseTopArtists, parseTopAlbums } from "../../lib/lastfm.ts";

export default async function handler(_req: Request, _ctx: Context): Promise<Response> {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;
  if (!apiKey || !username) {
    return new Response(JSON.stringify({ error: "Missing LASTFM_API_KEY or LASTFM_USERNAME env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await fetchListeningData(apiKey, username);
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch listening data" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
