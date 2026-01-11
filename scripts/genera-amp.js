const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const glob = require('glob');
const builder = require('xmlbuilder');
const cheerio = require('cheerio');

try {
  const ampDir = 'amp';
  fs.ensureDirSync(ampDir);

  const posts = [
    {
      slug: 'ultimi-30-giorni-politici-del-26-dicembre-2025---bruno-rachiele',
      title: 'Ultimi 30 giorni Politici del 26 dicembre 2025 - Bruno Rachiele',
      date: '2025-12-26',
      content: '<p>Contenuto dell\'articolo qui...</p>'
    },
    {
      slug: 'sondaggio-politico-27-dicembre-2025-supermedia-bruno-rachiele',
      title: 'Sondaggio Politico 27 dicembre 2025 – Supermedia Bruno Rachiele',
      date: '2025-12-27',
      content: '<p>Contenuto dell\'articolo qui...</p>'
    }
  ];

  // --- Genera file AMP ---
  posts.forEach(post => {
    const html = `<!doctype html>
<html amp lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>${post.title}</title>
  <link rel="canonical" href="https://amp.brunorachiele.it/${post.slug}.html">
  <meta name="pubdate" content="${post.date}">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
  <h1>${post.title}</h1>
  <time datetime="${post.date}">${dayjs(post.date).format('D MMMM YYYY')}</time>
  ${post.content}
</body>
</html>`;

    const filePath = path.join(ampDir, `${post.slug}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Generata pagina AMP: ${filePath}`);
  });

  // --- Genera sitemap ---
  const files = glob.sync('amp/**/*.html', { ignore: ['amp/sitemap.xml'] });

  const pages = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(content);
    const title = $('title').text() || 'Articolo AMP';
    const pubdate = $('meta[name="pubdate"]').attr('content') || '2000-01-01';
    return { file, title, pubdate };
  });

  // Ordina per data decrescente
  pages.sort((a,b) => new Date(b.pubdate) - new Date(a.pubdate));

  const urlset = builder.create('urlset', { encoding: 'UTF-8' });
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  pages.forEach(page => {
    const pathUrl = page.file.replace(/\\/g, '/').replace('amp/', '');
    urlset.ele('url')
      .ele('loc', {}, `https://amp.brunorachiele.it/${pathUrl}`).up()
      .ele('lastmod', {}, page.pubdate).up()
      .ele('title', {}, page.title);
  });

  const xml = urlset.end({ pretty: true });
  fs.writeFileSync(path.join(ampDir, 'sitemap.xml'), xml);
  console.log('amp/sitemap.xml generata correttamente!');
} catch (err) {
  console.error('Errore durante la generazione AMP o sitemap:', err);
  process.exit(1);
}
