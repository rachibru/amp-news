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

async function main() {
  console.log("Lettura feed RSS in corso...");

  const res = await fetch(RSS_URL);
  const xml = await res.text();

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .slice(0, 10)
    .map(m => m[1]);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const item of items) {
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1];
    const link = item.match(/<link>(.*?)<\/link>/)?.[1];
    const pubDateRaw = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

    if (!title || !link || !pubDateRaw) continue;

    const date = new Date(pubDateRaw);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const slug = link.split("/").pop().replace(".html", "");
    const relPath = `${year}/${month}/${slug}.html`;
    const outDir = path.join(OUTPUT_BASE, year, month);
    const outFile = path.join(outDir, `${slug}.html`);

    fs.mkdirSync(outDir, { recursive: true });

    const ampHtml = template
      .replace(/{{title}}/g, title)
      .replace(/{{link}}/g, link)
      .replace(/{{pubDate}}/g, date.toLocaleDateString("it-IT"))
      .replace(/{{isoDate}}/g, date.toISOString());

    fs.writeFileSync(outFile, ampHtml, "utf8");

    sitemap += `  <url>\n`;
    sitemap += `    <loc>${AMP_DOMAIN}/amp/${relPath}</loc>\n`;
    sitemap += `    <lastmod>${date.toISOString().split("T")[0]}</lastmod>\n`;
    sitemap += `  </url>\n`;
  }

  sitemap += `</urlset>`;
  fs.writeFileSync(SITEMAP_PATH, sitemap, "utf8");

  console.log("✅ AMP e sitemap generati correttamente");
}

main().catch(err => {
  console.error("❌ Errore:", err);
  process.exit(1);
});
