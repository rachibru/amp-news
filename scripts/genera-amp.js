const fs = require('fs');
const path = require('path');
const https = require('https');

// Config
const ampDir = 'amp';      // dove finiscono le pagine AMP
const outDir = 'output';   // sitemap.xml + mini-index
const RSS_URL = 'https://feeds.feedburner.com/brunorachiele/ZOU113SCMgV';
const articleTemplate = 'article.html'; // template base

// Crea cartelle principali
if (!fs.existsSync(ampDir)) fs.mkdirSync(ampDir);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Funzione per leggere RSS
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

fetchRSS(RSS_URL).then(xml => {
  const items = [];
  xml.replace(/<item>([\s\S]*?)<\/item>/g, (_, block) => {
    const title = /<title>(.*?)<\/title>/.exec(block);
    const link = /<link>(.*?)<\/link>/.exec(block);
    const pubDate = /<pubDate>(.*?)<\/pubDate>/.exec(block);
    if (title && link && pubDate) items.push({ title: title[1], link: link[1], pubDate: pubDate[1] });
  });

  // Prendi solo gli ultimi 10 articoli
  const latest = items.slice(0, 10);

  // Genera pagine AMP
  for (const item of latest) {
    let slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, ''); // esempio: politica-2026-analisi-demoscopiche-scenari
    const filePath = path.join(ampDir, slug + '.html');           // tutto in amp/

    let html = fs.readFileSync(articleTemplate, 'utf8');
    html = html.replace(/{{title}}/g, item.title)
               .replace(/{{link}}/g, item.link)
               .replace(/{{pubDate}}/g, item.pubDate)
               .replace(/{{isoDate}}/g, new Date(item.pubDate).toISOString());

    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Generata pagina AMP:', filePath);
  }

  // Genera sitemap.xml
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const item of latest) {
    const slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
    sitemap += `  <url>\n    <loc>https://amp.brunorachiele.it/${slug}.html</loc>\n    <lastmod>${new Date(item.pubDate).toISOString()}</lastmod>\n  </url>\n`;
  }
  sitemap += '</urlset>';
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Generata sitemap.xml');

  // Genera mini-index HTML
  let indexHtml = '<ul>\n';
  for (const item of latest) {
    const slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
    indexHtml += `  <li><a href="https://amp.brunorachiele.it/${slug}.html">${item.title}</a></li>\n`;
  }
  indexHtml += '</ul>';
  fs.writeFileSync(path.join(outDir, 'ultimi.html'), indexHtml, 'utf8');
  console.log('Generato mini-index ultimi articoli');

}).catch(err => {
  console.error('Errore nella generazione AMP o sitemap:', err);
  process.exit(1);
});
