import os
import re
import json
import shutil
import datetime
import feedparser

# Feed RSS di Blogger per estrarre tutti i post
FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss&max-results=500"

# Mappa delle immagini di sfondo statiche
BG_MAP = {
    "sondaggi": "https://static.brunorachiele.it/st-sondaggi.png",
    "rassegna": "https://static.brunorachiele.it/st-rassegna.png",
    "primepagine": "https://static.brunorachiele.it/st-primepagine.png",
    "generico": "https://static.brunorachiele.it/st-generico.png"
}

def clean_slug(title):
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    return re.sub(r'[-\s]+', '-', slug).strip('-')

def get_bg_and_tag(title):
    t_lower = title.lower()
    if "sondagg" in t_lower:
        return BG_MAP["sondaggi"], "Sondaggi"
    elif "rassegna" in t_lower:
        return BG_MAP["rassegna"], "Rassegna Stampa"
    elif "prima pagina" in t_lower or "prime pagine" in t_lower:
        return BG_MAP["primepagine"], "Prime Pagine"
    else:
        # Immagine di default per tutti gli altri argomenti
        return BG_MAP["generico"], "Notizie"

def generate_web_stories():
    # 0. Pulizia completa: elimina la cartella e riparte da zero
    if os.path.exists("stories"):
        shutil.rmtree("stories")
    os.makedirs("stories", exist_ok=True)

    with open("story_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    date_str = datetime.datetime.now().strftime("%d %B %Y")
    stories_list = []

    # 1. Storia fissa Prime Pagine
    title_pp = "Prime Pagine dei Giornali di Oggi"
    link_pp = "https://www.brunorachiele.it/p/prime-pagine-dei-giornali.html"
    bg_pp = BG_MAP["primepagine"]

    story_pp_html = template.replace("{{TITOLO_POST}}", title_pp)\
                            .replace("{{LINK_POST}}", link_pp)\
                            .replace("{{DATA_POST}}", date_str)\
                            .replace("{{CATEGORIA_TAG}}", "Prime Pagine")\
                            .replace("{{IMMAGINE_BG}}", bg_pp)

    output_pp = "stories/prime-pagine-dei-giornali.html"
    with open(output_pp, "w", encoding="utf-8") as f:
        f.write(story_pp_html)

    stories_list.append({
        "title": title_pp,
        "url": "https://amp.brunorachiele.it/stories/prime-pagine-dei-giornali.html",
        "image": bg_pp,
        "tag": "Prime Pagine"
    })

    # 2. Generazione storie dinamiche da feed RSS
    feed = feedparser.parse(FEED_URL)
    if feed.entries:
        for entry in feed.entries:
            title = entry.title
            link = entry.link
            slug = clean_slug(title)
            
            # Se la categoria non matcha, assegna la foto generica
            bg_url, tag_label = get_bg_and_tag(title)
            
            story_html = template.replace("{{TITOLO_POST}}", title)\
                                 .replace("{{LINK_POST}}", link)\
                                 .replace("{{DATA_POST}}", date_str)\
                                 .replace("{{CATEGORIA_TAG}}", tag_label)\
                                 .replace("{{IMMAGINE_BG}}", bg_url)

            story_file = f"{slug}.html"
            output_path = f"stories/{story_file}"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(story_html)

            stories_list.append({
                "title": title,
                "url": f"https://amp.brunorachiele.it/stories/{story_file}",
                "image": bg_url,
                "tag": tag_label
            })

    # 3. Creazione del feed JSON per il widget
    with open("stories/feed.json", "w", encoding="utf-8") as f:
        json.dump(stories_list, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    generate_web_stories()
