import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = "f3f8b886e0284caeb974ba755fe2e8a4";
const OUTPUT_DIR = path.join(__dirname, ".."); // amp/prime-pagine
const OUTPUT_FILE = path.join(OUTPUT_DIR, "index.html");

// Lista dei giornali da mostrare (italiani + alcuni internazionali)
const journals = [
  { country: "it", name: "corriere-della-sera" },
  { country: "it", name: "la-repubblica" },
  { country: "it", name: "il-sole-24-ore" },
  { country: "de", name: "frankfurter-allgemeine" },
  { country: "us", name: "new-york-times" },
  { country: "uk", name: "the-guardian" }
];

async function main() {
  console.log("✅ Generazione prime pagine AMP in corso...");

  let cardsHtml = "";

  for (const j of journals) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const url = `https://api.worldnewsapi.com/retrieve-front-page?api-key=${API_KEY}&source-name=${j.name}&source-country=${j.country}&date=${today}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.front_page || !data.front_page.image || !data.front_page.url) continue;

      const img = data.front_page.image;
      const link = data.front_page.url;
      const title = j.name.replace(/-/g, " ");

      cardsHtml += `
        <div class="card">
          <a href="${link}" target="_blank">
            <amp-img src="${img}" width="600" height="800" layout="responsive" alt="${title}"></amp-img>
            <div class="title">${title}</div>
          </a>
        </div>
      `;
    } catch (err) {
      console.error("⚠️ Errore caricamento giornale:", j.name, err.message);
    }
  }

  // Template completo AMP
  const html = `
  <!doctype html>
  <html ⚡ lang="it">
  <head>
    <meta charset="utf-8">
    <title>Prime Pagine dei Giornali | Bruno Rachiele</title>
    <link rel="canonical" href="https://amp.brunorachiele.it/prime-pagine/index.html">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <meta name="robots" content="index, follow">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <style amp-boilerplate>
      body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
      animation:-amp-start 8s steps(1,end) 0s 1 normal both}
      @keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
    </style>
    <noscript>
      <style amp-boilerplate>
        body{animation:none}
      </style>
    </noscript>
    <style amp-custom>
      body { font-family: Arial; max-width: 1024px; margin:auto; padding:16px; background:#fff; color:#111; }
      h1 { text-align:center; margin-bottom:24px; }
      .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
      .card { border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.15); }
      .card .title { text-align:center; padding:8px; font-weight:bold; background:#f0f0f0; }
      .ad { margin:24px 0; }
    </style>
  </head>
  <body>
    <h1>Prime Pagine dei Giornali</h1>
    <div class="ad">
      <amp-ad width="100vw" height="320" type="adsense"
        data-ad-client="ca-pub-9225028785900171"
        data-ad-slot="2980836148"
        data-auto-format="rspv" data-full-width="">
        <div overflow=""></div>
      </amp-ad>
    </div>
    <div class="cards">
      ${cardsHtml}
    </div>
  </body>
  </html>
  `;

  fs.writeFileSync(OUTPUT_FILE, html, "utf8");
  console.log("✅ Prime pagine AMP generate in", OUTPUT_FILE);
}

main().catch(err => {
  console.error("❌ Errore:", err);
  process.exit(1);
});
