import fs from "fs";
import fetch from "node-fetch";

const API_KEY = "f3f8b886e0284caeb974ba755fe2e8a4";
const OUTPUT = "amp/prime-pagine-mondo/index.html";

const TESTATE = [
  { nome: "New York Times", country: "us" },
  { nome: "The Guardian", country: "gb" },
  { nome: "Le Monde", country: "fr" },
  { nome: "Der Spiegel", country: "de" },
  { nome: "El País", country: "es" },
  { nome: "Corriere della Sera", country: "it" }
];

async function main() {
  let boxes = "";

  for (const t of TESTATE) {
    const url = `https://api.worldnewsapi.com/retrieve-front-page?source-country=${t.country}&api-key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
const img = data.front_page_image || data.image || data.top_image;
if (!img) continue;

    boxes += `
      <div class="box">
        <amp-img src="${img}"
          width="300"
          height="400"
          layout="responsive"
          alt="${t.nome}">
        </amp-img>
        <h2>${t.nome}</h2>
      </div>
    `;
  }

  let html = fs.readFileSync(OUTPUT, "utf8");
  html = html.replace(
    '<div id="contenuto" class="grid">',
    `<div id="contenuto" class="grid">${boxes}`
  );

  fs.writeFileSync(OUTPUT, html, "utf8");
  console.log("✅ Prime pagine MONDO aggiornate");
}

main();
