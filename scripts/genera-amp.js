const fs = require('fs');
const path = require('path');
const https = require('https');

// CONFIG
const AMP_DIR = 'amp';
const OUT_DIR = 'output';
const RSS_URL = 'https://feeds.feedburner.com/brunorachiele/ZOU113SCMgV';
const TEMPLATE_FILE = 'article.html';

// CREA CARTELLE SE NON ESISTONO
[AMP_DIR, OUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// LEGGE IL TEMPLATE
if (!fs.existsSync(TEMPLATE_FILE)) {
  console.error('Template article.html non trovato!');
  process.exit(1);
}
const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// FUNZIONE PER LEGGERE RSS
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

// MAIN
(async () => {
  try {
    console.log('Lettura feed RSS in corso...');
    const xml = await fetchRSS(RSS_URL);

    // Estrae gli item
    const items = [];
    xml.replace(/<item>([\s\S]*?)<\/item>/g, (_, block) => {
      const title = /<title>(.*?)<\/title>/.exec(block);
      const link = /<link>(.*?)<\/link>/.exec(block);
      const pubDate = /<pubDate>(.*?)<\/pubDate>/.exec(block);
      if (title && link && pubDate) items.push({
        title: title[1],
        link: link[1],
        pubDate: pubDate[1]
      });
    });

    if (items.length === 0) {
      console.log('Nessun articolo trovato nel feed.');
      return;
    }

    // Prendi solo ultimi 10 articoli
    const latest = items.slice(0, 10);

    // CREA PAGINE AMP
    latest.forEach(item => {
      let slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, ''); // rimuove dominio e slash finali
      if (slug.endsWith('.html')) slug = slug.slice(0, -5);         // rimuove eventuale .html
      const filePath = path.join(AMP_DIR, slug + '.html');

      let html = template
        .replace(/{{title}}/g, item.title)
        .replace(/{{link}}/g, item.link)
        .replace(/{{pubDate}}/g, item.pubDate)
        .replace(/{{isoDate}}/g, new Date(item.pubDate).toISOString());

      fs.writeFileSync(filePath, html, 'utf8');
      console.log('Generata pagina AMP:', filePath);
    });

    // CREA SITEMAP.XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    latest.forEach(item => {
      let slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
      if (slug.endsWith('.html')) slug = slug.slice(0, -5);
      sitemap += `  <url>\n    <loc>https://amp.brunorachiele.it/${slug}.html</loc>\n`;
      sitemap += `    <lastmod>${new Date(item.pubDate).toISOString()}</lastmod>\n  </url>\n`;
    });
    sitemap += '</urlset>';
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemap, 'utf8');
    console.log('Generata sitemap.xml');

    // CREA MINI-INDEX HTML
    let indexHtml = '<ul>\n';
    latest.forEach(item => {
      let slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
      if (slug.endsWith('.html')) slug = slug.slice(0, -5);
      indexHtml += `  <li><a href="https://amp.brunorachiele.it/${slug}.html">${item.title}</a></li>\n`;
    });
    indexHtml += '</ul>';
    fs.writeFileSync(path.join(OUT_DIR, 'ultimi.html'), indexHtml, 'utf8');
    console.log('Generato mini-index ultimi articoli');

  } catch (err) {
    console.error('Errore nella generazione AMP o sitemap:', err);
    process.exit(1);
  }
})();
