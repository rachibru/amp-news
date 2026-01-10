import feedparser
import os
import re
from datetime import datetime

# LINK FEED REALE DI BLOGGER
FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"

# CARTELLA AMP
AMP_DIR = "amp"

# IMMAGINE FISSA PER TUTTI GLI ARTICOLI
FIXED_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib-mwyxO9DqQx2o08DZF34q2BfiC3YeW9NebmMSRWxZ92ApQBwbBhuwhQhU9UeKYDDa_IqpLTDDHm9Em931n5KSDEjbMlJM4nmXhDgpplo_m6gZTR-3S8KOmWPNfzSZ5c0dlxcm0REM0RkMMGsF-BVpzsSQO0gmdrv6pD6n6kaXOYid7LpzueECp1sQ10/s1600/POLITICA.png"

# NUMERO MASSIMO DI ARTICOLI
MAX_ARTICLES = 10

# CREA CARTELLA SE NON ESISTE
os.makedirs(AMP_DIR, exist_ok=True)

feed = feedparser.parse(FEED_URL)

# funzione per creare slug
def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    return text.strip("-")

# Genera pagine AMP
for entry in feed.entries[:MAX_ARTICLES]:
    title = entry.title
    link = entry.link
    pubDate = datetime(*entry.published_parsed[:6]).strftime("%Y-%m-%d")
    slug = slugify(title)
    file_path = f"{AMP_DIR}/{slug}.html"

    amp_html = f"""<!doctype html>
<html ⚡ lang="it">
<head>
  <meta charset="utf-8">
  <title>{title} | Bruno Rachiele</title>
  <link rel="canonical" href="{link}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="{title}">
  <meta name="robots" content="index, follow">

  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>

  <style amp-boilerplate>
body{{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;
animation:-amp-start 8s steps(1,end) 0s 1 normal both}}
@-webkit-keyframes -amp-start{{from{{visibility:hidden}}to{{visibility:visible}}}}
@-moz-keyframes -amp-start{{from{{visibility:hidden}}to{{visibility:visible}}}}
@-ms-keyframes -amp-start{{from{{visibility:hidden}}to{{visibility:visible}}}}
@-o-keyframes -amp-start{{from{{visibility:hidden}}to{{visibility:visible}}}}
@keyframes -amp-start{{from{{visibility:hidden}}to{{visibility:visible}}}}
</style>
<noscript>
<style amp-boilerplate>
body{{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}}
</style>
</noscript>

  <style amp-custom>
    body{{font-family:Arial,sans-serif;max-width:760px;margin:auto;padding:16px;color:#111;}}
    h1{{font-size:1.7em;margin:15px 0;}}
    .date{{font-size:0.85em;color:#666;margin-bottom:10px;}}
    amp-img{{border-radius:8px;margin:15px 0;width:100%;height:auto;}}
    .cta{{display:block;text-align:center;margin:25px 0;padding:14px;background:#6598b7;color:#fff;font-size:1.1em;border-radius:6px;text-decoration:none;}}
    .ad{{margin:25px 0;}}
  </style>
</head>
<body>

<h1>{title}</h1>
<p class="date">{pubDate}</p>

<amp-img src="{FIXED_IMAGE}" width="1200" height="675" layout="responsive" alt="{title}"></amp-img>

<a class="cta" href="{link}">👉 Leggi l’articolo completo su brunorachiele.it</a>

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

</body>
</html>"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(amp_html)

print(f"Generate {min(MAX_ARTICLES,len(feed.entries))} AMP articles in '{AMP_DIR}/'")
