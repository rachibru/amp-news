import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const API_KEY = "f3f8b886e0284caeb974fe2e8a4"; // la tua chiave
const AMP_BASE = path.join(process.cwd(), "amp/prime-pagine");
const INDEX_PATH = path.join(AMP_BASE, "index.html");

// Lista testate italiane (puoi personalizzare)
const testate = [
  "Corriere della Sera",
  "La Repubblica",
  "La Stampa",
  "Il Sole 24 Ore",
  "Il Messaggero"
];

async function main() {
  fs.mkdirSync(AMP_BASE, { recursive: true });

  const cards = [];

  for (const testata of testate) {
    try {
      const url = `https://api.worldnewsapi.com/retrieve-front-page?api-key=${API_KEY}&source-name=${encodeURIComponent(testata)}&source-country=it`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.front_page || !data.front_page.image) continue;

      cards.push({
        nome: data.front_page.name,
        immagine: data.front_page.image,
        link: data.front_page.url || "#"
      });
    } catch (e) {
      console.error("Errore API testata:", testata, e.message);
    }
  }

  // Costruzione pagina AMP
  const html = `<!doctype html>
<html ⚡ lang="it">
<head>
<meta charset="utf-8">
<title>Prime Pagine | Bruno Rachiele</title>
<link rel="canonical" href="#">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<meta name="robots" content="index, follow">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<style amp-boilerplate>
body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
animation:-amp-start 8s steps(1,end) 0s 1 normal both}
@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
</style>
<noscript><style amp-boilerplate>body{animation:none}</style></noscript>
<style amp-custom>
body { font-family: Arial,sans-serif; max-width: 800px; margin:auto; padding:16px; }
h1 { text-align:center; margin-bottom:24px; }
.ritaglio { margin-bottom:24px; text-align:center; }
.ritaglio amp-img { border-radius:8px; width:100%; max-width:600px; height:auto; }
</style>
</head>
<body>
<h1>Prime Pagine</h1>
${cards.map(c => `
<div class="ritaglio">
<a href="${c.link}" target="_blank">
<amp-img src="${c.immagine}" width="600" height="800" layout="responsive" alt="${c.nome}"></amp-img>
<br>${c.nome}
</a>
</div>
`).join("\n")}
</body>
</html>`;

  fs.writeFileSync(INDEX_PATH, html, "utf8");
  console.log("✅ Prime pagine AMP generata in amp/prime-pagine/index.html");
}

main().catch(e => console.error(e));
