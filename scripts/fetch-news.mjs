import fs from "node:fs/promises";

const API_KEY = process.env.NEWS_API_KEY;
if (!API_KEY) {
  console.error("Missing NEWS_API_KEY");
  process.exit(1);
}

// categorías que usas en el menú
const CATEGORIES = ["general", "technology", "business", "sports", "entertainment"];
const COUNTRY = "us";
const PAGE_SIZE = 20;

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} on ${url}\n${t.slice(0,200)}`);
  }
  return r.json();
}

async function getTopHeadlines(category) {
  const u = new URL("https://newsapi.org/v2/top-headlines");
  u.searchParams.set("country", COUNTRY);
  u.searchParams.set("category", category);
  u.searchParams.set("pageSize", String(PAGE_SIZE));
  u.searchParams.set("apiKey", API_KEY);
  const data = await fetchJSON(u.toString());
  // Nos quedamos solo con los campos que usamos
  return (data.articles || []).map(a => ({
    title: a.title,
    description: a.description,
    url: a.url,
    urlToImage: a.urlToImage,
    source: a.source?.name ?? "",
    publishedAt: a.publishedAt
  }));
}

async function main() {
  await fs.mkdir("data", { recursive: true });
  for (const cat of CATEGORIES) {
    try {
      const articles = await getTopHeadlines(cat);
      const payload = { updatedAt: new Date().toISOString(), country: COUNTRY, category: cat, articles };
      await fs.writeFile(`data/news-cache-${cat}.json`, JSON.stringify(payload, null, 2), "utf8");
      console.log(`Saved ${articles.length} → data/news-cache-${cat}.json`);
    } catch (e) {
      console.warn(`Category ${cat} failed:`, e.message);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
