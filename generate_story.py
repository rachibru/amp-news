import os
import re
import datetime
import urllib.parse
import feedparser

# Configurazione URL ed Etichette Sfondi Statici
FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"
BASE_ASSETS = "https://amp.brunorachiele.it/assets/"

BG_MAP = {
    "sondaggi": BASE_ASSETS + "bg-sondaggi.jpg",
    "rassegna": BASE_ASSETS + "bg-rassegna.jpg",
    "prima pagina": BASE_ASSETS + "bg-primepagine.jpg",
    "prime pagine": BASE_ASSETS + "bg-primepagine.jpg",
    "generico": BASE_ASSETS + "bg-generico.jpg"
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
        return BG_MAP["prime pagina"], "Prime Pagine"
    else:
        return BG_MAP["generico"], "Notizie"

def generate_web_stories():
    feed = feedparser.parse(FEED_URL)
    if not feed.entries:
        print("Nessun articolo trovato nel feed.")
        return

    with open("story_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    os.makedirs("stories", exist_ok=True)

    for entry in feed.entries[:5]: # Elabora gli ultimi 5 articoli
        title = entry.title
        link = entry.link
        date_str = datetime.datetime.now().strftime("%d %B %Y")
        slug = clean_slug(title)
        
        bg_url, tag_label = get_bg_and_tag(title)
        
        story_html = template.replace("{{TITOLO_POST}}", title)\
                             .replace("{{LINK_POST}}", link)\
                             .replace("{{DATA_POST}}", date_str)\
                             .replace("{{CATEGORIA_TAG}}", tag_label)\
                             .replace("{{IMMAGINE_BG}}", bg_url)

        output_path = f"stories/{slug}.html"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(story_html)
        print(f"Generata Web Story: {output_path}")

if __name__ == "__main__":
    generate_web_stories()
