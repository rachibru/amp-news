import os
import re
import datetime
import feedparser
from urllib.parse import urlparse
from bs4 import BeautifulSoup

RSS_FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"

def clean_text_for_summary(html_content, max_chars=200):
    """Estrae un estratto di testo pulito senza tag HTML per il summary/description."""
    soup = BeautifulSoup(html_content, 'html.parser')
    text = soup.get_text(separator=' ', strip=True)
    # Limita la lunghezza del testo e aggiunge i puntini di sospensione
    if len(text) > max_chars:
        return text[:max_chars].rsplit(' ', 1)[0] + '...'
    return text

def parse_iso_date(entry):
    """Converte la data del feed nel formato ISO 8601 per Schema.org."""
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        dt = datetime.datetime(*entry.published_parsed[:6])
    else:
        dt = datetime.datetime.now()
    return dt.strftime("%Y-%m-%dT%H:%M:%S+00:00")

def main():
    feed = feedparser.parse(RSS_FEED_URL)
    
    if not os.path.exists('template.html'):
        print("Errore: template.html non trovato.")
        return

    with open('template.html', 'r', encoding='utf-8') as f:
        template = f.read()
        
    for entry in feed.entries:
        title = entry.title
        link = entry.link
        content = entry.summary if 'summary' in entry else entry.description
        
        # Formattazione data ISO 8601 per Schema.org
        pub_date_iso = parse_iso_date(entry)
        
        # Generazione estrazione testo pulito
        summary_text = clean_text_for_summary(content, max_chars=220)
        
        # Estrazione del percorso relativo dall'URL (es. 2026/10/titolo-post.html)
        parsed_url = urlparse(link)
        rel_path = parsed_url.path.lstrip('/')
        full_filepath = rel_path
        
        # Crea le cartelle necessarie (es. 2026/10/)
        os.makedirs(os.path.dirname(full_filepath), exist_ok=True)
        
        # Sostituzione dei segnaposto nel template.html
        page_html = template.replace('{{ TITLE }}', title)\
                            .replace('{{ CANONICAL_URL }}', link)\
                            .replace('{{ SUMMARY }}', summary_text)\
                            .replace('{{ DESCRIPTION }}', summary_text)\
                            .replace('{{ DATE_PUBLISHED }}', pub_date_iso)\
                            .replace('{{ DATE_MODIFIED }}', pub_date_iso)
        
        with open(full_filepath, 'w', encoding='utf-8') as f:
            f.write(page_html)
            
        print(f"Generata AMP: {full_filepath}")

if __name__ == '__main__':
    main()
