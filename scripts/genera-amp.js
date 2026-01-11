const fs = require('fs-extra');
const path = require('path');
// fetch compatibile Node 20 / GitHub Actions
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const xml2js = require('xml2js');
const dayjs = require('dayjs');
const builder = require('xmlbuilder');
const cheerio = require('cheerio');

const ampDir = 'amp';
fs.ensureDirSync(ampDir);

// URL del feed RSS
const RSS_URL = 'https://feeds.feedburner.com/brunorachiele/ZOU113SCMgV';

async function main() {
  try {
    console.log('Lettura feed RSS in corso...');
    const res = await fetch(RSS_URL);
    const xml = await res.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    const items = result.rss.channel[0].item;

    const posts = items.map(item => {
      const slug = item.link[0].replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
      const title = item.title[0];
      const date = dayjs(item.pubDate[0]).format('YYYY-MM-DD');
      const content = item['content:encoded'] ? item['content:encoded'][0] : '<p>Contenuto non disponibile</p>';
      return { slug, title, date, content };
    });

    // --- Genera file AMP con cartelle anno/mese ---
    posts.forEach(post => {
      const pubDate = dayjs(post.date);
      const folderPath = path.join(ampDir, pubDate.format('YYYY'), pubDate.format('MM'));
      fs.ensureDirSync(folderPath); // crea tutte le cartelle intermedie

      const filePath = path.join(folderPath, `${post.slug}.html`);
      const html = `<!doctype html>
<html amp lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>${post.title}</title>
  <link rel="canonical" href="https://amp.brunorachiele.it/${pubDate.format('YYYY')}/${pubDate.format('MM')}/${post.slug}.html">
  <meta name="pubdate" content="${post.date}">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
  <h1>${post.title}</h1>
  <time datetime="${post.date}">${pubDate.format('D MMMM YYYY')}</time>
  ${post.content}
</body>
</html>`;

      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`Generata pagina AMP: ${filePath}`);
    });

    // --- Genera sitemap ---
    const pages = posts.map(post => {
      const pubDate = dayjs(post.date);
      const file = path.join(ampDir, pubDate.format('YYYY'), pubDate.format('MM'), `${post.slug}.html`);
      return { file, title: post.title, pubdate: post.date };
    });

    pages.sort((a,b) => new Date(b.pubdate) - new Date(a.pubdate));

    const urlset = builder.create('urlset', { encoding: 'UTF-8' });
    urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    pages.forEach(page => {
      const pathUrl = path.relative(ampDir, page.file).replace(/\\/g, '/');
      urlset.ele('url')
        .ele('loc', {}, `https://amp.brunorachiele.it/${pathUrl}`).up()
        .ele('lastmod', {}, page.pubdate).up()
        .ele('title', {}, page.title);
    });

    const sitemapXml = urlset.end({ pretty: true });
    fs.writeFileSync(path.join(ampDir, 'sitemap.xml'), sitemapXml);
    console.log('amp/sitemap.xml generata correttamente!');

  } catch (err) {
    console.error('Errore nella generazione AMP o sitemap:', err);
    process.exit(1);
  }
}

main();
