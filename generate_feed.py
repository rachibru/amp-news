import feedparser
import json
import os
import re

# Config
FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"
OUTPUT_FEED = "feed.json"
ARTICLES_DIR = "articles"
MAX_ITEMS = 10
FIXED_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib-mwyxO9DqQx2o08DZF34q2BfiC3YeW9NebmMSRWxZ92ApQBwbBhuwhQhU9UeKYDDa_IqpLTDDHm9Em931n5KSDEjbMlJM4nmXhDgpplo_m6gZTR-3S8KOmWPNfzSZ5c0dlxcm0REM0RkMMGsF-BVpzsSQO0gmdrv6pD6n6kaXOYid7LpzueECp1sQ10/s1600/POLITICA.png"

# Helper function per slug pulito
def slugify(text):
    text = text.lower()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^\w\-]', '', text)
    return text

# Leggi feed
feed = feedparser.parse(FEED_URL)
items = []

# Crea cartella articoli se non esiste
os.makedirs(ARTICLES_DIR, exist_ok=True)

for entry in feed.entries[:MAX_ITEMS]:
    slug = slugify(entry.title)
    article_file = f"{ARTICLES_DIR}/{slug}.html"
    
    # Crea pagina AMP articolo
    article_html = f"""<!doctype html>
<html ⚡ lang="it">
<head>
<meta charset="utf-8">
<title>{entry.title} | Bruno Rachiele</title>
<link rel="canonical" href="{entry.link}">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
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
<noscript><style amp-boilerplate>body{{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}}</style></noscript>

<style amp-custom>
body {{ font-family: Arial,sans-serif; max-width:760px; margin:auto; padding:16px; color:#111; }}
h1 {{ font-size:1.8em; margin-bottom:10px; }}
.date {{ font-size:0.85em; color:#666; margin-bottom:15px; }}
amp-img {{ width:100%; height:auto; border-radius:6px; margin-bottom:15px; }}
.cta {{ display:block; text-align:center; padding:12px; background:#6598b7; color:#fff; border-radius:5px; text-decoration:none; font-weight:bold; margin-top:20px; }}
.ad {{ margin:25px 0; }}
header {{ text-align:center; margin-bottom:20px; }}
</style>
</head>
<body>

<header>
<amp-img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiOeKLAFzNySkI5ahC_uZiv0Asne6shnjr1QndoMNmRBtkNdQfe59GGO3nY5nc5C4OCXNMXGXu1XtHm0X7gPqbvTgFjqszFGQrPD3G5R4c2MIJPiZk5OX6dLbnYKeU1itEVo7OcJB9I0N-Wi9z9WP64l5_btoNMrZ111Ex8i-W9UcKwOJPv5uDnl6LwhA/s1600/2ed26cc2-38e4-4d67-a1c5-5e522b654c90.png"
width="90" height="90" layout="fixed" alt="Bruno Rachiele"></amp-img>
</header>

<h1>{entry.title}</h1>
<p class="date">{entry.published}</p>

<amp-img src="{FIXED_IMAGE}" width="1200" height="675" layout="responsive" alt="{entry.title}"></amp-img>

<div class="ad">
<amp-ad width="100vw" height="320" type="adsense"
 data-ad-client="ca-pub-9225028785900171"
 data-ad-slot="2980836148"
 data-auto-format="rspv" data-full-width="">
 <div overflow=""></div>
</amp-ad>
</div>

<a class="cta" href="{entry.link}">Leggi l’articolo completo su brunorachiele.it →</a>

</body>
</html>
"""
    with open(article_file, "w", encoding="utf-8") as f:
        f.write(article_html)
    
    # Aggiungi articolo al feed.json
    items.append({
        "title": entry.title,
        "link": f"{ARTICLES_DIR}/{slug}.html",
        "pubDate": entry.published,
        "thumbnail": FIXED_IMAGE
    })

# Scrivi feed.json
with open(OUTPUT_FEED, "w", encoding="utf-8") as f:
    json.dump({"items": items}, f, ensure_ascii=False, indent=2)

print(f"Generati {len(items)} articoli AMP e feed.json")
