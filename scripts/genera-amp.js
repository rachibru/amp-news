const fs = require('fs-extra');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const xml2js = require('xml2js');
const dayjs = require('dayjs');
const builder = require('xmlbuilder');

const ampDir = 'amp';
fs.ensureDirSync(ampDir);

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
      const date = dayjs(item.pubDate[0]);
      const isoDate = date.format('YYYY-MM-DD');
      const content = item['content:encoded'] ? item['content:encoded'][0] : '<p>Contenuto non disponibile</p>';
      const link = item.link[0];
      return { slug, title, date, isoDate, content, link };
    });

    // --- Genera pagine AMP ---
    posts.forEach(post => {
      const folderPath = path.join(ampDir, post.date.format('YYYY'), post.date.format('MM'));
      fs.ensureDirSync(folderPath);

      const filePath = path.join(folderPath, `${post.slug}.html`);

      const html = `<!doctype html>
<html ⚡ lang="it">
<head>
  <meta charset="utf-8">
  <title>${post.title} | Bruno Rachiele</title>
  <link rel="canonical" href="${post.link}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="robots" content="index, follow">

  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
  <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>

  <style amp-boilerplate>
    body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
    animation:-amp-start 8s steps(1,end) 0s 1 normal both}
    @keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
  </style>
  <noscript>
    <style amp-boilerplate>body{animation:none}</style>
  </noscript>

  <style amp-custom>
    body { font-family: Arial, sans-serif; max-width: 760px; margin: auto; padding: 16px; background: #fff; color: #111; }
    header { text-align: center; margin-bottom: 20px; }
    h1 { font-size: 1.7em; line-height: 1.25; margin: 16px 0 8px; }
    .date { font-size: 0.85em; color: #666; }
    amp-img { border-radius: 8px; margin: 16px 0; }
    .cta { display: block; margin: 24px 0; padding: 14px; background: #6598b7; color: #fff; text-align: center; font-size: 1.1em; border-radius: 6px; text-decoration: none; }
    .ad { margin: 28px 0; }
    footer { text-align: center; font-size: 0.85em; color: #666; margin-top: 32px; }
  </style>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "${post.link}" },
    "headline": "${post.title}",
    "image": ["https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib-mwyxO9DqQx2o08DZF34q2BfiC3YeW9NebmMSRWxZ92ApQBwbBhuwhQhU9UeKYDDa_IqpLTDDHm9Em931n5KSDEjbMlJM4nmXhDgpplo_m6gZTR-3S8KOmWPNfzSZ5c0dlxcm0REM0RkMMGsF-BVpzsSQO0gmdrv6pD6n6kaXOYid7LpzueECp1sQ10/s1600/POLITICA.png"],
    "datePublished": "${post.isoDate}",
    "dateModified": "${post.isoDate}",
    "author": { "@type": "Person", "name": "Bruno Rachiele" },
    "publisher": { "@type": "Organization", "name": "Bruno Rachiele", "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiOeKLAFzNySkI5ahC_uZiv0Asne6shnjr1QndoMNmRBtkNdQfe59GGO3nY5nc5C4OCXNMXGXu1XtHm0X7gPqbvTgFjqszFGQrPD3G5R4c2MIJPiZCk5OX6dLbnYKeU1itEVo7OcJB9I0N-Wi9z9WP64l5_btoNMrZ111Ex8i-W9UcKwOJPv5uDnl6LwhA/s1600/logo.png" } }
  }
  </script>
</head>

<body>
<amp-analytics type="gtag">
  <script type="application/json">
  {"vars":{"gtag_id":"G-EBDJS2FK9G","config":{"G-EBDJS2FK9G":{"groups":"default"}}}}
  </script>
</amp-analytics>

<header>
  <h1>${post.title}</h1>
  <div class="date">${post.date.format('D MMMM YYYY')}</div>
</header>

<amp-img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib-mwyxO9DqQx2o08DZF34q2BfiC3YeW9NebmMSRWxZ92ApQBwbBhuwhQhU9UeKYDDa_IqpLTDDHm9Em931n5KSDEjbMlJM4nmXhDgpplo_m6gZTR-3S8KOmWPNfzSZ5c0dlxcm0REM0RkMMGsF-BVpzsSQO0gmdrv6pD6n6kaXOYid7LpzueECp1sQ10/s1600/POLITICA.png"
  width="1200" height="675" layout="responsive" alt="${post.title}"></amp-img>

<a class="cta" href="${post.link}">👉 Leggi l’articolo completo su brunorachiele.it</a>

<div class="ad">
  <amp-ad width="100vw" height="320"
    type="adsense"
    data-ad-client="ca-pub-9225028785900171"
    data-ad-slot="2980836148"
    data-auto-format="rspv"
    data-full-width="">
    <div overflow=""></div>
  </amp-ad>
</div>

<footer>© brunorachiele.it</footer>
</body>
</html>`;

      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`Generata pagina AMP: ${filePath}`);
    });

    // --- Genera sitemap ---
    const pages = posts.map(post => {
      const folderPath = path.join(post.date.format('YYYY'), post.date.format('MM'));
      const file = path.join(ampDir, folderPath, `${post.slug}.html`);
      return { file, title: post.title, pubdate: post.isoDate };
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

    fs.writeFileSync(path.join(ampDir, 'sitemap.xml'), urlset.end({ pretty: true }));
    console.log('amp/sitemap.xml generata correttamente!');

  } catch (err) {
    console.error('Errore nella generazione AMP o sitemap:', err);
    process.exit(1);
  }
}

main();
