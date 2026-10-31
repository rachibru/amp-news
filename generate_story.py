<div class="sw-main-box">
  <div class="sw-row" id="web-stories-container">
    <div class="sw-card-item sw-skeleton">
      <div class="sw-card-frame"></div>
      <span class="sw-label">Caricamento...</span>
    </div>
  </div>
</div>

<style>
  /* Contenitore Principale */
  .sw-main-box {
    width: 100% !important;
    background: #ffffff !important;
    padding: 12px 0 !important;
    margin-bottom: 20px !important;
    box-sizing: border-box !important;
    border-bottom: 1px solid #eaeaea !important;
  }
  
  .sw-row {
    display: flex !important;
    flex-direction: row !important;
    gap: 12px !important;
    overflow-x: auto !important;
    padding: 4px 10px !important;
    margin: 0 !important;
    list-style: none !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  
  .sw-row::-webkit-scrollbar {
    display: none !important;
  }
  
  /* Scheda Singola 9:16 */
  .sw-card-item {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-decoration: none !important;
    width: 90px !important;
    min-width: 90px !important;
    flex-shrink: 0 !important;
    transition: transform 0.2s ease !important;
  }
  
  .sw-card-item:hover {
    transform: translateY(-3px) !important;
  }
  
  /* Cornice 9:16 con sfumatura stile Instagram */
  .sw-card-frame {
    position: relative !important;
    width: 90px !important;
    height: 150px !important;
    border-radius: 12px !important;
    padding: 3px !important;
    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888) !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  
  /* Immagine di copertina */
  .sw-card-frame img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 9px !important;
    display: block !important;
  }
  
  /* Sfumatura per il testo */
  .sw-card-overlay {
    position: absolute !important;
    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.85) 100%) !important;
    border-radius: 9px !important;
    pointer-events: none !important;
  }
  
  /* Badge STORY */
  .sw-card-tag {
    position: absolute !important;
    top: 6px !important;
    left: 6px !important;
    background: rgba(230, 57, 70, 0.9) !important;
    color: #ffffff !important;
    font-size: 8px !important;
    font-weight: 800 !important;
    padding: 2px 5px !important;
    border-radius: 4px !important;
    text-transform: uppercase !important;
    font-family: Arial, sans-serif !important;
    letter-spacing: 0.5px !important;
  }
  
  /* Titolo sovrapposto sull'immagine */
  .sw-card-title-overlay {
    position: absolute !important;
    bottom: 8px !important;
    left: 6px !important;
    right: 6px !important;
    color: #ffffff !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    line-height: 1.2 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
  }
  
  /* Etichetta sotto la scheda */
  .sw-label {
    margin-top: 6px !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    color: #262626 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  }
  
  /* Skeleton Loading */
  .sw-skeleton .sw-card-frame {
    background: #e0e0e0 !important;
    animation: sw-pulse 1.5s infinite !important;
  }
  @keyframes sw-pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
</style>

<script>
  (function() {
    // Identica a clean_slug() presente in generate_story.py
    function cleanSlug(title) {
      return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[-\s]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    var feedUrl = "https://www.brunorachiele.it/feeds/posts/default?alt=json&max-results=6";
    
    fetch(feedUrl)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        var container = document.getElementById("web-stories-container");
        if (!container || !data.feed.entry) return;
        
        container.innerHTML = "";
        
        // 1. STORY FISSA PRIME PAGINE
        var staticHtml = `
          <a href="https://amp.brunorachiele.it/stories/prime-pagine-dei-giornali.html" class="sw-card-item" target="_self">
            <div class="sw-card-frame">
              <img src="https://static.brunorachiele.it/st-primepagine.png" alt="Prime Pagine" />
              <div class="sw-card-overlay"></div>
              <span class="sw-card-tag">Fissa</span>
              <div class="sw-card-title-overlay">Prime Pagine dei Giornali</div>
            </div>
            <span class="sw-label">Prime Pagine</span>
          </a>
        `;
        container.innerHTML += staticHtml;

        // 2. ULTIME STORIE DINAMICHE DAI POST
        data.feed.entry.forEach(function(entry) {
          var title = entry.title.$t;
          var slug = cleanSlug(title);
          
          // Costruisce l'URL esatto: https://amp.brunorachiele.it/stories/slug.html
          var storyUrl = "https://amp.brunorachiele.it/stories/" + slug + ".html";
          
          // Immagine di copertina (utilizza la thumbnail ad alta risoluzione o lo sfondo predefinito)
          var imgUrl = "https://static.brunorachiele.it/st-generico.png";
          if (entry.media$thumbnail && entry.media$thumbnail.url) {
            imgUrl = entry.media$thumbnail.url.replace('/s72-c/', '/w600-h1066-c/');
          }
          
          var cardHtml = `
            <a href="${storyUrl}" class="sw-card-item" target="_self">
              <div class="sw-card-frame">
                <img src="${imgUrl}" alt="${title}" onerror="this.src='https://static.brunorachiele.it/st-generico.png';" />
                <div class="sw-card-overlay"></div>
                <span class="sw-card-tag">Story</span>
                <div class="sw-card-title-overlay">${title}</div>
              </div>
              <span class="sw-label">${title}</span>
            </a>
          `;
          
          container.innerHTML += cardHtml;
        });
      })
      .catch(function(err) {
        console.error("Errore nel caricamento Web Stories:", err);
      });
  })();
</script>
