import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const API_KEY = "f3f8b886e0284caeb974ba755fe2e8a4"; // tua chiave API
const AMP_BASE = path.join(process.cwd(), "amp/prime-pagine");
const INDEX_PATH = path.join(AMP_BASE, "index.html");

// Lista testate: italiane e internazionali
const testate = [
  "Corriere della Sera",
  "La Repubblica",
  "La Stampa",
  "Il Sole 24 Ore",
  "Il Messaggero",
  "Frankfurter Allgemeine",
  "Süddeutsche Zeitung",
  "Le Monde",
  "The Guardian",
  "The New York Times",
  "Washington Post"
];

async function main() {
  fs.mkdirSync(AMP_BASE, { recursive: true });

  const cards = [];

  for (const testata of testate.sort()) { // ordine alfabetico
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

  // Costruzione pagina AMP con Ads integrata
  let html = `<!doctype html>
<html ⚡ lang="it">
<head>
<meta charset="utf-8">
<title>Prime Pagine | Bruno Rachiele</title>
<link rel="canonical" href="#">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<meta name="robots" content="index, follow">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-ad"
  src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>

<style amp-boilerplate>
body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
animation:-amp-start 8s steps(1,end) 0s 1 normal both}
@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
</style>
<noscript><style amp-boilerplate>body{animation:none}</style></noscript>

<style amp-custom>
body { font-family: Arial,sans-serif; max-width: 800px; margin:auto; padding:16px; background:#fff; }
h1 { text-align:center; margin-bottom:24px; }
.ritaglio { margin-bottom:24px; text-align:center; }
.ritaglio amp-img { border-radius:8px; width:100%; max-width:600px; height:auto; }
.ad { margin:32px 0; text-align:center; }
</style>
</head>
<body>
<h1>Prime Pagine dei Giornali</h1>
`;

  // Inseriamo i giornali e gli annunci ogni 3 giornali
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    html += `<div class="ritaglio">
<a href="${c.link}" target="_blank">
<amp-img src="${c.immagine}" width="600" height="800" layout="responsive" alt="${c.nome}"></amp-img>
<br>${c.nome}
</a>
</div>
`;

    // Inserimento Ads ogni 3 giornali
    if ((i + 1) % 3 === 0) {
      html += `<div class="ad">
  <amp-ad width="300" height="250"
    type="adsense"
    data-ad-client="ca-pub-9225028785900171"
    data-ad-slot="2980836148">
  </amp-ad>
</div>
`;
    }
  }

  html += `</body>\n</html>`;

  fs.writeFileSync(INDEX_PATH, html, "utf8");
  console.log("✅ Prime pagine AMP generata con Ads in amp/prime-pagine/index.html");
}

main().catch(e => console.error(e));
