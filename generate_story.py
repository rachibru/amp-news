import os
import re
import datetime
import feedparser

# Feed RSS di Blogger per i post standard
FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"

# Mappa delle immagini di sfondo statiche
BG_MAP = {
    "sondaggi": "https://amp.brunorachiele.it/assets/bg-sondaggi.jpg",
    "rassegna": "https://amp.brunorachiele.it/assets/bg-rassegna.jpg",
    "prima pagina": "https://amp.brunorachiele.it/assets/bg-primepagine.jpg",
    "prime pagine": "https://amp.brunorachiele.it/assets/bg-primepagine.jpg",
    "generico": "https://amp.brunorachiele.it/assets/bg-generico.jpg"
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
    # Caricamento del template HTML
    with open("story_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    os.makedirs("stories", exist_ok=True)
    date_str = datetime.datetime.now().strftime("%d %B %Y")

    # ----------------------------------------------------
    # 1. GENERAZIONE AUTOMATICA PER LE PRIME PAGINE (Pagina Statica)
    # ----------------------------------------------------
    title_pp = "Prime Pagine dei Giornali di Oggi"
    link_pp = "https://www.brunorachiele.it/p/prime-pagine-dei-giornali.html"
    bg_pp = BG_MAP["prime pagina"]

    story_pp_html = template.replace("{{TITOLO_POST}}", title_pp)\
                            .replace("{{LINK_POST}}", link_pp)\
                            .replace("{{DATA_POST}}", date_str)\
                            .replace("{{CATEGORIA_TAG}}", "Prime Pagine")\
                            .replace("{{IMMAGINE_BG}}", bg_pp)

    output_pp = "stories/prime-pagine-dei-giornali.html"
    with open(output_pp, "w", encoding="utf-8") as f:
        f.write(story_pp_html)
    print(f"Generata Web Story Statica: {output_pp}")

    # ----------------------------------------------------
    # 2. GENERAZIONE DA FEED RSS PER I POST NORMALI
    # ----------------------------------------------------
    feed = feedparser.parse(FEED_URL)
    if feed.entries:
        for entry in feed.entries[:5]:
            title = entry.title
            link = entry.link
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
