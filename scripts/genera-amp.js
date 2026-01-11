const fs = require('fs');
const path = require('path');
const https = require('https');

// ----------------------------
// CONFIGURAZIONE
// ----------------------------
const ampDir = 'amp';      // dove finiranno le pagine AMP
const outDir = 'output';   // sitemap.xml + mini-index
const RSS_URL = 'https://feeds.feedburner.com/brunorachiele/ZOU113SCMgV';
const articleTemplate = 'article.html'; // file base da clonare per AMP

// ----------------------------
// CREA CARTELLE PRINCIPALI
// ----------------------------
if (!fs.existsSync(ampDir)) fs.mkdirSync(ampDir);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// ----------------------------
// FUNZIONE PER LEGGERE RSS
// ----------------------------
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

// ----------------------------
// ELABORAZIONE FEED
// ----------------------------
fetchRSS(RSS_URL).then(xml => {
  const items = [];

  // Estrae title, link e pubDate
  xml.replace(/<item>([\s\S]*?)<\/item>/g, (_, block) => {
    const title = /<title>(.*?)<\/title>/.exec(block);
    const link = /<link>(.*?)<\/link>/.exec(block);
    const pubDate = /<pubDate>(.*?)<\/pubDate>/.exec(block);
    if (title && link && pubDate) {
      items.push({ title: title[1], link: link[1], pubDate: pubDate[1] });
    }
  });

  // ----------------------------
  // GENERA PAGINE AMP
  // ----------------------------
  for (const item of items) {
    // Crea slug semplice
    const slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, '');

    // Cartelle anno/mese per struttura
    const pub = new Date(item.pubDate);
    const folder = path.join(ampDir, pub.getFullYear().toString(), String(pub.getMonth()+1).padStart(2,'0'));
    fs.mkdirSync(folder, { recursive: true }); // CREAZIONE CARTELLE

    const filePath = path.join(folder, slug + '.html');

    let html = fs.readFileSync(articleTemplate, 'utf8');
    html = html.replace(/{{title}}/g, item.title)
               .replace(/{{link}}/g, item.link)
               .replace(/{{pubDate}}/g, item.pubDate)
               .replace(/{{isoDate}}/g, pub.toISOString());

    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Generata pagina AMP:', filePath);
  }

  // ----------------------------
  // GENERA SITEMAP.XML
  // ----------------------------
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const item of items) {
    const slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
    sitemap += `  <url>\n    <loc>https://amp.brunorachiele.it/${slug}.html</loc>\n    <lastmod>${new Date(item.pubDate).toISOString()}</lastmod>\n  </url>\n`;
  }
  sitemap += '</urlset>';
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Generata sitemap.xml');

  // ----------------------------
  // GENERA MINI-INDEX HTML (ULTIMI ARTICOLI)
  // ----------------------------
  let indexHtml = '<ul>\n';
  for (const item of items) {
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
