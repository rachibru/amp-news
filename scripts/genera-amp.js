// Per ogni articolo
for (const item of items) {
  // Creiamo uno slug semplice senza doppie estensioni
  let slug = item.link.replace(/^https?:\/\/[^\/]+\/|\/$/g, ''); // esempio: politica-2026-analisi-demoscopiche-scenari

  // Se vuoi cartelle per anno/mese:
  const pub = new Date(item.pubDate);
  const folder = path.join(ampDir, pub.getFullYear().toString(), String(pub.getMonth()+1).padStart(2,'0'));

  // CREA CARTELLE SE NON ESISTONO
  fs.mkdirSync(folder, { recursive: true });

  const filePath = path.join(folder, slug + '.html'); // <-- così non ci saranno .html.html

  let html = fs.readFileSync('article.html', 'utf8');
  html = html.replace(/{{title}}/g, item.title)
             .replace(/{{link}}/g, item.link)
             .replace(/{{pubDate}}/g, item.pubDate)
             .replace(/{{isoDate}}/g, new Date(item.pubDate).toISOString());

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Generata pagina AMP:', filePath);
}
