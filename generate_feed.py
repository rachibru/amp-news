import feedparser
import json

FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"
OUTPUT_FILE = "feed.json"
MAX_ITEMS = 10
FIXED_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib-mwyxO9DqQx2o08DZF34q2BfiC3YeW9NebmMSRWxZ92ApQBwbBhuwhQhU9UeKYDDa_IqpLTDDHm9Em931n5KSDEjbMlJM4nmXhDgpplo_m6gZTR-3S8KOmWPNfzSZ5c0dlxcm0REM0RkMMGsF-BVpzsSQO0gmdrv6pD6n6kaXOYid7LpzueECp1sQ10/s1600/POLITICA.png"

feed = feedparser.parse(FEED_URL)

items = []
for entry in feed.entries[:MAX_ITEMS]:
    items.append({
        "title": entry.title,
        "link": entry.link,
        "pubDate": entry.published,
        "thumbnail": FIXED_IMAGE
    })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump({"items": items}, f, ensure_ascii=False, indent=2)
