const Parser = require('rss-parser');
const fs = require('fs-extra');
const slugify = require('slugify');

const parser = new Parser();

async function generateAMP() {
  try {
    console.log("🚀 Avvio generazione pagine AMP...");

    const feedURL = 'https://www.brunorachiele.it/feeds/posts/default?alt=rss';
    console.log("📡 Scarico feed RSS da:", feedURL);

    const feed = await parser.parseURL(feedURL);

    if (!feed.items || feed.items.length === 0) {
      console.warn("⚠️ Nessun articolo trovato nel feed RSS!");
      return;
    }

    fs.ensureDirSync('amp');

    let indexItems = [];

    feed.items.slice(0, 10).forEach((post, i) => {
      const slug = slugify(post.title || `articolo-${i+1}`, { lower: true, strict: true });

      // Estrai prima immagine dal contenuto HTML
      let thumbnail = null;
      const htmlContent = post['content:encoded'] || '';
      const imgMatches = [...htmlContent.matchAll(/<img[^>]+src="([^">]+)"/gi)];
      if (imgMatches.length > 0) thumbnail = imgMatches[0][1];

      // Snippet breve di 150 caratteri
      const snippet = post.contentSnippet
        ? post.contentSnippet.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
        : '';

      // Aggiungi all'array per amp-list
      indexItems.push({
        title: post.title,
        link: `amp/${slug}.html`,
        pubDate: post.pubDate || '',
        thumbnail: thumbnail
      });

      // Crea pagina singola AMP
      const articleHtml = `<!doctype html>
<html ⚡ lang="it">
<head>
<meta charset="utf-8">
<title>${post.title} | Bruno Rachiele</title>
<link rel="canonical" href="${post.link}">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<meta name="description" content="${snippet}">
<meta name="robots" content="index, follow">

<script async src="https://cdn.ampproject.org/v0.js"></script>

<style amp-boilerplate>
body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
      -moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
      -ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
      animation:-amp-start 8s steps(1,end) 0s 1 normal both}
@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
</style>
<noscript>
<style amp-boilerplate>
body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}
</style>
</noscript>

<style amp-custom>
body { font-family: Arial,sans-serif; max-width:800px; margin:auto; padding:20px; color:#111; }
h1 { text-align:center; margin-bottom:20px; }
amp-img { margin-bottom:10px; }
p { text-align:center; margin-top:15px; font-weight:bold; }
a.read-more { display:block; text-align:center; margin-top:10px; font-weight:bold; color:#1a73e8; text-decoration:none; }
</style>

</head>
<body>
<h1>${post.title}</h1>
${thumbnail ? `<amp-img src="${thumbnail}" width="600" height="400" layout="responsive" alt="${post.title}"></amp-img>` : ''}
<p>${post.pubDate || ''}</p>
<a class="read-more" href="${post.link}" target="_blank">Leggi l'articolo completo su bruno-rachiele.it</a>
</body>
</html>`;

      fs.writeFileSync(`amp/${slug}.html`, articleHtml.trim());
      console.log(`📝 Pagina AMP generata: amp/${slug}.html`);
    });

    // Genera feed.json per amp-list
    fs.writeFileSync('feed.json', JSON.stringify({ items: indexItems }, null, 2));
    console.log("✅ feed.json aggiornato");

    // Genera index.html AMP
    const indexHtml = `<!doctype html>
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

<style amp-boilerplate>
body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
      -moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
      -ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
      animation:-amp-start 8s steps(1,end) 0s 1 normal both}
@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
</style>
<noscript>
<style amp-boilerplate>
body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}
</style>
</noscript>

<style amp-custom>
body { font-family: Arial,sans-serif; max-width:800px; margin:auto; padding:20px; color:#111; }
h1 { text-align:center; margin-bottom:20px; }
article { margin-bottom:30px; border-bottom:1px solid #ddd; padding-bottom:15px; }
h2 { font-size:1.4em; margin:0 0 8px; }
amp-img { margin-bottom:10px; }
p { margin:4px 0; }
a { color:#1a73e8; text-decoration:none; }
.read-more { display:inline-block; margin-top:8px; font-weight:bold; color:#1a73e8; }
</style>
</head>
<body>
<h1>Ultime Notizie</h1>
<amp-list width="auto" height="1600" layout="fixed-height" src="feed.json" items="items">
<template type="amp-mustache">
<article>
{{#thumbnail}}
<amp-img src="{{thumbnail}}" width="600" height="400" layout="responsive" alt="{{title}}"></amp-img>
{{/thumbnail}}
<h2><a href="{{link}}">{{title}}</a></h2>
<p>{{pubDate}}</p>
<a class="read-more" href="{{link}}">Leggi l'articolo completo</a>
</article>
</template>
</amp-list>
</body>
</html>`;

    fs.writeFileSync('index.html', indexHtml.trim());
    console.log("✅ index.html AMP generato");

    console.log("🎉 Generazione completata con successo!");
  } catch (err) {
    console.error("❌ Errore durante la generazione AMP:", err.message);
  }
}

generateAMP();
