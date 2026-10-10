import os
import re
import datetime
import feedparser
from bs4 import BeautifulSoup

RSS_FEED_URL = "https://www.brunorachiele.it/feeds/posts/default?alt=rss"

def transform_to_amp(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Converte tutte le immagini standard in <amp-img> obbligatorio
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
        
    os.makedirs('pages', exist_ok=True)
    
    for entry in feed.entries:
        title = entry.title
        link = entry.link
        content = entry.summary if 'summary' in entry else entry.description
        pub_date = entry.published if 'published' in entry else datetime.datetime.now().isoformat()
        
        # Genera il nome file partendo dalla fine del link
        slug = link.split('/')[-1].replace('.html', '')
        filename = f"pages/{slug}.html"
        
        amp_content = transform_to_amp(content)
        
        page_html = template.replace('{{ TITLE }}', title)
        page_html = page_html.replace('{{ CANONICAL_URL }}', link)
        page_html = page_html.replace('{{ CONTENT }}', amp_content)
        page_html = page_html.replace('{{ DATE }}', pub_date)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(page_html)
            
        print(f"Generata AMP: {filename}")

if __name__ == '__main__':
    main()
