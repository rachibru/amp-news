import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RSS_URL = "https://feeds.feedburner.com/brunorachiele/ZOU113SCMgV";
const AMP_DOMAIN = "https://amp.brunorachiele.it";
const AMP_BASE = "amp";
const TEMPLATE_PATH = path.join(__dirname, "../article.html");
const OUTPUT_BASE = path.join(__dirname, "..", AMP_BASE);
const SITEMAP_PATH = path.join(OUTPUT_BASE, "sitemap.xml");

function itemLink(item){
  const pubDateRaw = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
  const link = item.match(/<link>(.*?)<\/link>/)?.[1];
  const slug = link.split("/").pop().replace(".html","");
  const date = new Date(pubDateRaw);
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2,"0");
  return `${year}/${month}/${slug}.html`;
}

async function main() {
  console.log("Lettura feed RSS in corso...");

  const res = await fetch(RSS_URL);
  const xml = await res.text();

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .slice(0, 10)
    .map(m => m[1]);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  // --------------------------
  // 1️⃣ Pagine AMP + sitemap
  // --------------------------
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for(const item of items){
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1];
    const link = item.match(/<link>(.*?)<\/link>/)?.[1];
    const pubDateRaw = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
    if(!title || !link || !pubDateRaw) continue;

    const date = new Date(pubDateRaw);
    const relPath = itemLink(item);
    const outFile = path.join(OUTPUT_BASE, relPath);
    const outDir = path.dirname(outFile);

    fs.mkdirSync(outDir, { recursive: true });

    const ampHtml = template
      .replace(/{{title}}/g, title)
      .replace(/{{link}}/g, link)
      .replace(/{{pubDate}}/g, date.toLocaleDateString("it-IT"))
      .replace(/{{isoDate}}/g, date.toISOString());

    fs.writeFileSync(outFile, ampHtml, "utf8");

    sitemap += `  <url>\n    <loc>${AMP_DOMAIN}/${AMP_BASE}/${relPath}</loc>\n    <lastmod>${date.toISOString().split("T")[0]}</lastmod>\n  </url>\n`;
  }

  sitemap += "</urlset>";
  fs.writeFileSync(SITEMAP_PATH, sitemap, "utf8");

  // --------------------------
  // 2️⃣ Feed Google News
  // --------------------------
  let newsFeed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n  <channel>\n    <title>Bruno Rachiele - Notizie</title>\n    <link>${AMP_DOMAIN}/${AMP_BASE}/</link>\n    <description>Ultime notizie politiche e sondaggi</description>\n`;

  for(const item of items){
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1];
    if(!title) continue;
    const link = `${AMP_DOMAIN}/${AMP_BASE}/${itemLink(item)}`;
    const pubDateRaw = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
    const date = new Date(pubDateRaw);

    newsFeed += `    <item>\n`;
    newsFeed += `      <title><![CDATA[${title}]]></title>\n`;
    newsFeed += `      <link>${link}</link>\n`;
    newsFeed += `      <news:publication_date>${date.toISOString()}</news:publication_date>\n`;
    newsFeed += `      <news:language>it</news:language>\n`;
    newsFeed += `      <news:genres>PressRelease</news:genres>\n`;
    newsFeed += `      <news:access>Subscription</news:access>\n`;
    newsFeed += `    </item>\n`;
  }

  newsFeed += "  </channel>\n</rss>";
  fs.writeFileSync(path.join(OUTPUT_BASE,"google-news.xml"), newsFeed,"utf8");

  console.log("✅ AMP, sitemap e feed Google News generati correttamente");
}

main().catch(err=>{
  console.error("❌ Errore:", err);
  process.exit(1);
});
