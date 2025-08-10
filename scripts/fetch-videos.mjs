import fs from "node:fs/promises";

// === Configura tus canales (IDs) ===
const CHANNELS = [
  'UC52X5wxOL_s5yw0dQk7NtgA', // Associated Press
  'UChqUTb7kYRX8-EiaN3XFrSQ', // Reuters
  'UC16niRr50-MSBwiO3YDb3RA', // BBC News
  //'UCknLrEdhRCp1aegoMqRaCZg', // DW News
  //'UCBi2mrWuNuyYy4gbM6fU18Q', // ABC News
  //'UC8p1vwvWtl6T73JiExfWs1A', // CBS News
  //'UCeY0bbntWzzVIaj2z3QigXg', // NBC News
  //'UCUMZ7gohGI9HcU9VNsr2FJQ', // Bloomberg Television
  //'UCoMdktPbSTixAyNGwb-UYkQ'  // Sky News
];

const MAX_SHOW = 6;
const PER_CHANNEL_SEARCH = 8;
const YT_API_KEY = process.env.YT_API_KEY;

if (!YT_API_KEY) {
  console.error("Missing YT_API_KEY env var");
  process.exit(1);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${url}\n${text.slice(0,200)}`);
  }
  return res.json();
}

async function getLatestFromChannel(channelId) {
  const search = new URL("https://www.googleapis.com/youtube/v3/search");
  search.searchParams.set("key", YT_API_KEY);
  search.searchParams.set("channelId", channelId);
  search.searchParams.set("part", "snippet");
  search.searchParams.set("order", "date");
  search.searchParams.set("type", "video");
  search.searchParams.set("videoEmbeddable", "true");
  search.searchParams.set("eventType", "completed"); // <-- EXCLUIR lives/upcoming
  search.searchParams.set("maxResults", String(PER_CHANNEL_SEARCH));

  const data = await fetchJSON(search.toString());

  // filtra por VOD (no live) por si el API te cuela alguno
  const completedOnly = (data.items || []).filter(
    i => i?.snippet?.liveBroadcastContent === "none"
  );

  const ids = completedOnly.map(i => i.id.videoId).filter(Boolean);
  if (!ids.length) return [];

  const details = new URL("https://www.googleapis.com/youtube/v3/videos");
  details.searchParams.set("key", YT_API_KEY);
  details.searchParams.set("id", ids.join(","));
  details.searchParams.set("part", "status,snippet,contentDetails");

  const data2 = await fetchJSON(details.toString());

  // embebibles solamente
  return (data2.items || [])
    .filter(v => v.status?.embeddable)
    .map(v => ({
      id: v.id,
      title: v.snippet?.title ?? "Untitled",
      channel: v.snippet?.channelTitle ?? "Channel"
    }));
}


async function searchFallback(query = "US news live") {
  const search = new URL("https://www.googleapis.com/youtube/v3/search");
  search.searchParams.set("key", YT_API_KEY);
  search.searchParams.set("q", query);
  search.searchParams.set("part", "snippet");
  search.searchParams.set("order", "date");
  search.searchParams.set("type", "video");
  search.searchParams.set("videoEmbeddable", "true");
  search.searchParams.set("maxResults", "10");

  const data = await fetchJSON(search.toString());
  const ids = (data.items || []).map(i => i.id.videoId).filter(Boolean);
  if (!ids.length) return [];

  const details = new URL("https://www.googleapis.com/youtube/v3/videos");
  details.searchParams.set("key", YT_API_KEY);
  details.searchParams.set("id", ids.join(","));
  details.searchParams.set("part", "status,snippet");

  const data2 = await fetchJSON(details.toString());
  return (data2.items || [])
    .filter(v => v.status?.embeddable)
    .map(v => ({
      id: v.id,
      title: v.snippet?.title ?? "Untitled",
      channel: v.snippet?.channelTitle ?? "Channel"
    }));
}

async function main() {
  let all = [];

  // 1) Por canales
  for (const ch of CHANNELS) {
    try {
      const vids = await getLatestFromChannel(ch);
      all.push(...vids);
      if (all.length >= MAX_SHOW) break;
    } catch (e) {
      console.warn("Channel failed:", ch, e.message);
    }
  }

  // 2) Fallback global si quedó corto
  if (all.length < 3) {
    try {
      const more = await searchFallback("US news");
      all = [...all, ...more];
    } catch (e) {
      console.warn("Global search failed:", e.message);
    }
  }

  const finalList = all.slice(0, MAX_SHOW);

  // Asegura carpeta data/
  await fs.mkdir("data", { recursive: true });

  // Guarda el JSON estático que servirá el frontend
  await fs.writeFile(
    "data/videos-cache.json",
    JSON.stringify({ updatedAt: new Date().toISOString(), videos: finalList }, null, 2),
    "utf8"
  );

  console.log(`Saved ${finalList.length} videos to data/videos-cache.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
