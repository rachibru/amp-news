const fs = require('fs');
const path = require('path');
const https = require('https');
const xml2js = require('xml2js');

const ampDir = 'amp';
const RSS_URL = 'https://feeds.feedburner.com/brunorachiele/ZOU113SCMgV';

if (!fs.existsSync(ampDir)) {
    console.error('ERRORE: cartella amp/ non trovata. Creala manualmente.');
    process.exit(1);
}

function fetchRSS(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', err => reject(err));
    });
}

(async () => {
    try {
        const xml = await fetchRSS(RSS_URL);
        xml2js.parseString(xml, (err, result) => {
            if (err) throw err;
            const items = result.rss.channel[0].item;
            for (const item of items) {
                const slug = item.link[0].replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
                const filePath = path.join(ampDir, slug + '.html');
                let html = fs.readFileSync('article.html', 'utf8');
                html = html.replace(/{{title}}/g, item.title[0])
                           .replace(/{{link}}/g, item.link[0])
                           .replace(/{{pubDate}}/g, '')
                           .replace(/{{isoDate}}/g, '');
                fs.writeFileSync(filePath, html, 'utf8');
                console.log('Generata pagina AMP:', filePath);
            }
        });
    } catch (e) {
        console.error('Errore nella generazione AMP:', e);
        process.exit(1);
    }
})();
