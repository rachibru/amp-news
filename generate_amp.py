import os
import re
import datetime
import feedparser
from urllib.parse import urlparse
from bs4 import BeautifulSoup

RSS_FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"

def transform_to_amp(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Converte tutte le immagini standard in <amp-img>
    for img in soup.find_all('img'):
        amp_img = soup.new_tag('amp-img')
        amp_img['src'] = img.get('src', '')
        amp_img['width'] = img.get('width', '800')
        amp_img['height'] = img.get('height', '600')
        amp_img['layout'] = 'responsive'
        amp_img['alt'] = img.get('alt', 'Immagine articolo')
        img.replace_with(amp_img)
        
    # Rimuove script e iframe non conformi ad AMP
    for tag in soup.find_all(['script', 'iframe']):
        tag.decompose()
        
    return str(soup)

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
        pub_date = entry.published if 'published' in entry else datetime.datetime.now().isoformat()
        
        # Estrarre il percorso completo dall'URL (es. /2026/10/nome-articolo.html)
        parsed_url = urlparse(link)
        rel_path = parsed_url.path.lstrip('/') # Rimuove lo slash iniziale
        
        # Percorso finale: pages/2026/10/nome-articolo.html
        full_filepath = os.path.join('pages', rel_path)
        
        # Crea automaticamente le sottocartelle (es. pages/2026/10/)
        os.makedirs(os.path.dirname(full_filepath), exist_ok=True)
        
        amp_content = transform_to_amp(content)
        
        page_html = template.replace('{{ TITLE }}', title)
        page_html = page_html.replace('{{ CANONICAL_URL }}', link)
        page_html = page_html.replace('{{ CONTENT }}', amp_content)
        page_html = page_html.replace('{{ DATE }}', pub_date)
        
        with open(full_filepath, 'w', encoding='utf-8') as f:
            f.write(page_html)
            
        print(f"Generata AMP: {full_filepath}")

if __name__ == '__main__':
    main()
