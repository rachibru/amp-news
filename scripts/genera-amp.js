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

// Il tuo feed RSS
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
      // crea uno slug dall'URL
      const slug = item.link[0].replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
      const title = item.title[0];
      const date = dayjs(item.pubDate[0]).format('YYYY-MM-DD');
      const content = item['content:encoded'] ? item['content:encoded'][0] : '<p>Contenuto non disponibile</p>';
      return { slug, title, date, content };
    });

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
    const pages = posts.map(post => ({
      file: `${post.slug}.html`,
      title: post.title,
      pubdate: post.date
    }));

    // Ordina per data decrescente
    pages.sort((a,b) => new Date(b.pubdate) - new Date(a.pubdate));

    const urlset = builder.create('urlset', { encoding: 'UTF-8' });
    urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    pages.forEach(page => {
      urlset.ele('url')
        .ele('loc', {}, `https://amp.brunorachiele.it/${page.file}`).up()
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
