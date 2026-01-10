const Parser = require('rss-parser');
const fs = require('fs-extra');
const slugify = require('slugify');

const parser = new Parser();

async function generateAMP() {
  try {
    console.log("🚀 Avvio generazione pagine AMP...");

    // Scarica il feed RSS
    console.log("📡 Scarico feed RSS dal blog...");
    const feed = await parser.parseURL('https://brunorachiele.blogspot.com/feeds/posts/default?alt=rss');

    if (!feed.items || feed.items.length === 0) {
      console.warn("⚠️ Nessun articolo trovato nel feed RSS!");
      return;
    }

    console.log(`✅ Trovati ${feed.items.length} articoli`);

    // Crea cartella amp se non esiste
    fs.ensureDirSync('amp');

    let indexItems = [];

    for (let i = 0; i < feed.items.length; i++) {
      const post = feed.items[i];
      const slug = slugify(post.title, { lower: true, strict: true });
      console.log(`📝 Creo pagina AMP: amp/${slug}.html`);

      let thumbnail = null;
      const imgMatch = post['content:encoded']?.match(/<img[^>]+src="([^">]+)"/i);
      if (imgMatch) thumbnail = imgMatch[1];

      const snippet = post.contentSnippet
        ? post.contentSnippet.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...'
        : '';

      indexItems.push({
        title: post.title,
        link: `amp/${slug}.html`,
        pubDate: post.pubDate || '',
        contentSnippet: snippet,
        thumbnail: thumbnail
      });

      // Controllo che il contenuto abbia almeno titolo
      if (!post.title) {
        console.warn(`⚠️ Articolo senza titolo, skip: ${post.link}`);
        continue;
      }

      // HTML pagina singolo articolo
      const articleHtml = `
<!doctype html>
<html ⚡ lang="it">
<head>
<meta charset="utf-8">
<title>${post.title} | Bruno Rachiele</title>
<link rel="canonical" href="${post.link}">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<meta name="description" content="${snippet}">
<meta name="robots" content="index, follow">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<style amp-custom>
body { font-family: Arial,sans-serif; max-width:800px; margin:auto; padding:20px; color:#111; }
.logo { display:block; margin:0 auto 20px; width:120px; height:120px; }
h1 { text-align:center; margin-bottom:20px; }
p { line-height:1.6; margin:4px 0; }
amp-img { margin-bottom:10px; }
a.read-more { display:inline-block; margin-top:10px; font-weight:bold; color:#1a73e8; }
</style>
</head>
<body>
<img class="logo" src="../logo.png" alt="Logo Bruno Rachiele">
<h1>${post.title}</h1>
${thumbnail ? `<amp-img src="${thumbnail}" width="600" height="400" layout="responsive" alt="${post.title}"></amp-img>` : ''}
<p>${snippet}</p>
<a class="read-more" href="${post.link}" target="_blank">Leggi tutto sul sito</a>
</body>
</html>`;

      // Scrive la pagina AMP
      try {
        fs.writeFileSync(`amp/${slug}.html`, articleHtml.trim());
      } catch (writeErr) {
        console.error(`❌ Errore scrittura file amp/${slug}.html:`, writeErr.message);
      }
    }

    // Genera feed.json
    const feedJson = { items: indexItems.slice(0, 10) };
    try {
      fs.writeFileSync('feed.json', JSON.stringify(feedJson, null, 2));
      console.log("✅ feed.json aggiornato");
    } catch (jsonErr) {
      console.error("❌ Errore scrittura feed.json:", jsonErr.message);
    }

    // Genera index.html
    const indexHtml = `
<!doctype html>
<html ⚡ lang="it">
<head>
<meta charset="utf-8">
<title>Ultime Notizie | Bruno Rachiele</title>
<link rel="canonical" href="https://amp.brunorachiele.it/">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<meta name="description" content="Ultime notizie aggiornate automaticamente dal sito Bruno Rachiele.">
<meta name="robots" content="index, follow">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
<style amp-custom>
body { font-family: Arial,sans-serif; max-width:800px; margin:auto; padding:20px; color:#111; }
.logo { display:block; margin:0 auto 20px; width:120px; height:120px; }
h1 { text-align:center; margin-bottom:20px; }
article { margin-bottom:30px; border-bottom:1px solid #ddd; padding-bottom:15px; }
h2 { font-size:1.4em; margin:0 0 8px; }
a { color:#1a73e8; text-decoration:none; }
p { line-height:1.6; margin:4px 0; }
amp-img { margin-bottom:10px; }
.read-more { display:inline-block; margin-top:8px; font-weight:bold; color:#1a73e8; }
</style>
</head>
<body>
<img class="logo" src="logo.png" alt="Logo Bruno Rachiele">
<h1>Ultime Notizie</h1>
<amp-list width="auto" height="1600" layout="fixed-height" src="feed.json" items="items">
<template type="amp-mustache">
<article>
{{#thumbnail}}
<amp-img src="{{thumbnail}}" width="600" height="400" layout="responsive" alt="{{title}}"></amp-img>
{{/thumbnail}}
<h2><a href="{{link}}">{{title}}</a></h2>
<p>{{pubDate}}</p>
<p>{{contentSnippet}}</p>
<a class="read-more" href="{{link}}">Leggi tutto</a>
</article>
</template>
</amp-list>
</body>
</html>
    `;
    fs.writeFileSync('index.html', indexHtml.trim());
    console.log("✅ index.html generato");

    console.log("🎉 Generazione completata con successo!");
  } catch (err) {
    console.error("❌ Errore durante la generazione AMP:", err.message);
  }
}

generateAMP();
