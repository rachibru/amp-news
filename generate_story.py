import os
import re
import shutil
import datetime
import feedparser

# Feed RSS di Blogger configurato per estrarre fino a 500 post
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
        return BG_MAP["generico"], "Notizie"

def generate_web_stories():
    # ----------------------------------------------------
    # 0. ELIMINA TUTTE LE STORIE VECCHIE E RICREA LA CARTELLA DA ZERO
    # ----------------------------------------------------
    if os.path.exists("stories"):
        shutil.rmtree("stories")
        print("Cartella 'stories' eliminata con successo.")
    
    os.makedirs("stories", exist_ok=True)
    print("Cartella 'stories' ricreata da zero.")

    # Caricamento del template HTML
    with open("story_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    date_str = datetime.datetime.now().strftime("%d %B %Y")

    # ----------------------------------------------------
    # 1. GENERAZIONE AUTOMATICA PER LE PRIME PAGINE (Pagina Statica)
    # ----------------------------------------------------
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
    print(f"Generata Web Story Statica: {output_pp}")

    # ----------------------------------------------------
    # 2. GENERAZIONE NUOVE STORIE DA FEED RSS
    # ----------------------------------------------------
    feed = feedparser.parse(FEED_URL)
    if feed.entries:
        print(f"Trovati {len(feed.entries)} post nel feed. Generazione storie in corso...")
        for entry in feed.entries:
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
