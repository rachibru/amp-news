# Generazione forzata giornaliera per la pagina statica Prime Pagine
def generate_prime_pagine_story():
    with open("story_template.html", "r", encoding="utf-8") as f:
        template = f.read()
        
    title = "Prime Pagine dei Giornali di Oggi"
    link = "https://www.brunorachiele.it/p/prime-pagine-dei-giornali.html" # Sostituisci con l'URL esatto della tua pagina
    date_str = datetime.datetime.now().strftime("%d %B %Y")
    bg_url = BG_MAP["prime pagina"]
    
    story_html = template.replace("{{TITOLO_POST}}", title)\
                         .replace("{{LINK_POST}}", link)\
                         .replace("{{DATA_POST}}", date_str)\
                         .replace("{{CATEGORIA_TAG}}", "Prime Pagine")\
                         .replace("{{IMMAGINE_BG}}", bg_url)

    output_path = "stories/prime-pagine-dei-giornali.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(story_html)
    print(f"Aggiornata Web Story fissa: {output_path}")
