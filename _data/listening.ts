import { fetchListeningData } from "../lib/lastfm.ts";

export default async function () {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;

  if (!apiKey || !username) return null;

  try {
    return await fetchListeningData(apiKey, username);
  } catch {
    return null;
  }
}
