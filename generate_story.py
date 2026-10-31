import os
import re
import datetime
import feedparser

# Feed RSS di Blogger
FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"

# Mappa dei tuoi link statici per le immagini di sfondo
BG_MAP = {
    "sondaggi": "https://TUO_LINK_STATICO/bg-sondaggi.jpg",
    "rassegna": "https://TUO_LINK_STATICO/bg-rassegna.jpg",
    "prima pagina": "https://TUO_LINK_STATICO/bg-primepagine.jpg",
    "prime pagine": "https://TUO_LINK_STATICO/bg-primepagine.jpg",
    "generico": "https://TUO_LINK_STATICO/bg-generico.jpg"
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
        return BG_MAP["prima pagina"], "Prime Pagine"
    else:
        return BG_MAP["generico"], "Notizie"

def generate_web_stories():
    feed = feedparser.parse(FEED_URL)
    if not feed.entries:
        print("Nessun articolo trovato nel feed RSS.")
        return

    # Legge il template dalla radice del repository
    with open("story_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    os.makedirs("stories", exist_ok=True)

    for entry in feed.entries[:5]: # Prende gli ultimi 5 articoli
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
