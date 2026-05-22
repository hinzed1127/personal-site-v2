const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";

export interface NowPlayingTrack {
  artist: string;
  track: string;
  album: string;
  image: string;
}

export interface RecentTrack extends NowPlayingTrack {
  date: string;
}

export interface TopArtist {
  name: string;
  playcount: string;
  url: string;
}

export interface TopAlbum {
  name: string;
  artist: string;
  playcount: string;
  image: string;
  url: string;
}

export interface ListeningResponse {
  nowPlaying: NowPlayingTrack | null;
  recentTrack: RecentTrack | null;
  topArtists: { week: TopArtist[]; month: TopArtist[] };
  topAlbums: { week: TopAlbum[]; month: TopAlbum[] };
}

function lastfmUrl(method: string, params: Record<string, string>, apiKey: string, username: string): string {
  const query = new URLSearchParams({
    method,
    user: username,
    api_key: apiKey,
    format: "json",
    ...params,
  });
  return `${LASTFM_BASE}?${query}`;
}

function extractImage(images: Array<{ "#text": string; size: string }>): string {
  return images?.find((i) => i.size === "extralarge")?.["#text"] ?? images?.find((i) => i.size === "large")?.["#text"] ?? "";
}

export function parseRecentTracks(data: any): {
  nowPlaying: NowPlayingTrack | null;
  recentTrack: RecentTrack | null;
} {
  const raw = data?.recenttracks?.track ?? [];
  const tracks: any[] = Array.isArray(raw) ? raw : [raw];
  if (tracks.length === 0) return { nowPlaying: null, recentTrack: null };

  const first = tracks[0];
  const isNowPlaying = first["@attr"]?.nowplaying === "true";

  const nowPlaying: NowPlayingTrack | null = isNowPlaying
    ? {
        artist: first.artist["#text"],
        track: first.name,
        album: first.album["#text"],
        image: extractImage(first.image),
      }
    : null;

  const recentSource = isNowPlaying ? tracks[1] : tracks[0];
  const recentTrack: RecentTrack | null = recentSource
    ? {
        artist: recentSource.artist["#text"],
        track: recentSource.name,
        album: recentSource.album["#text"],
        image: extractImage(recentSource.image),
        date: recentSource.date?.uts ?? "",
      }
    : null;

  return { nowPlaying, recentTrack };
}

export function parseTopArtists(data: any): TopArtist[] {
  return (data?.topartists?.artist ?? []).map((a: any) => ({
    name: a.name,
    playcount: a.playcount,
    url: a.url ?? "",
  }));
}

export function parseTopAlbums(data: any): TopAlbum[] {
  return (data?.topalbums?.album ?? []).map((a: any) => ({
    name: a.name,
    artist: a.artist?.name ?? "",
    playcount: a.playcount,
    image: extractImage(a.image),
    url: a.url ?? "",
  }));
}

export async function fetchListeningData(apiKey: string, username: string): Promise<ListeningResponse> {
  const [recentData, artistsWeek, artistsMonth, albumsWeek, albumsMonth] =
    await Promise.all([
      fetch(lastfmUrl("user.getRecentTracks", { limit: "2" }, apiKey, username)).then((r) => r.json()),
      fetch(lastfmUrl("user.getTopArtists", { period: "7day", limit: "5" }, apiKey, username)).then((r) => r.json()),
      fetch(lastfmUrl("user.getTopArtists", { period: "1month", limit: "5" }, apiKey, username)).then((r) => r.json()),
      fetch(lastfmUrl("user.getTopAlbums", { period: "7day", limit: "5" }, apiKey, username)).then((r) => r.json()),
      fetch(lastfmUrl("user.getTopAlbums", { period: "1month", limit: "5" }, apiKey, username)).then((r) => r.json()),
    ]);

  const { nowPlaying, recentTrack } = parseRecentTracks(recentData);

  return {
    nowPlaying,
    recentTrack,
    topArtists: {
      week: parseTopArtists(artistsWeek),
      month: parseTopArtists(artistsMonth),
    },
    topAlbums: {
      week: parseTopAlbums(albumsWeek),
      month: parseTopAlbums(albumsMonth),
    },
  };
}
