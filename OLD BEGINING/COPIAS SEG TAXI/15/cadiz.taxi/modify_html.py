import re

with open(r'c:\Users\frn\Documents\cadiz.taxi\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update JSON-LD for LocalBusiness
old_schema = """    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Guía Taxis de Cádiz",
      "description": "Directorio informativo sobre servicios de transporte urbano e interurbano en Cádiz.",
      "url": "https://cadiz.taxi/"
    }
    </script>"""

new_schema = """    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TaxiService",
      "name": "Radio Taxi Cádiz - Guía de Servicios",
      "image": "https://cadiz.taxi/logo.png",
      "url": "https://cadiz.taxi/",
      "telephone": "+34956212121",
      "priceRange": "€€",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cádiz",
        "addressRegion": "Andalucía",
        "addressCountry": "ES"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.52,
        "longitude": -6.29
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "00:00",
        "closes": "23:59"
      }
    }
    </script>"""

html = html.replace(old_schema, new_schema)

# 2. Update CSS version
html = html.replace('href="styles.css?v=1.12.0"', 'href="styles.css?v=1.13.0"')

# 3. Add SEO Block and Legal Links to Footer
old_legal = """            <div class="legal-disclaimer glass">
                <p data-translate="footer-disclaimer"><strong>Aviso Legal y Exención de Responsabilidad:</strong> cadiz.taxi es un portal web de carácter estrictamente informativo y publicitario, independiente de Radio Taxi Cádiz y del Ayuntamiento de Cádiz. Toda la información proporcionada es orientativa y recopilada de fuentes públicas. No nos hacemos responsables de posibles modificaciones en las tarifas o variaciones. Recomendamos solicitar el precio final al conductor antes de iniciar el trayecto.</p>
            </div>"""

new_legal = """            <div class="seo-text-block" style="margin-bottom: 2rem; color: var(--text-muted); font-size: 0.85rem; line-height: 1.6; text-align: justify; padding: 0 1rem;">
                <strong>Servicio de Taxi en Cádiz:</strong> cadiz.taxi es el directorio de movilidad definitivo para turistas y residentes. Encuentra información sobre la centralita de radiotaxi, reservas anticipadas para el aeropuerto de Jerez, traslados a la estación de Renfe y paradas oficiales en toda la bahía. Servicio de Eurotaxi (hasta 8 plazas), cobro con tarjeta, Bizum y facturas para empresas.
            </div>
            <div class="legal-disclaimer glass">
                <p data-translate="footer-disclaimer"><strong>Aviso Legal y Exención de Responsabilidad:</strong> cadiz.taxi es un portal web de carácter estrictamente informativo y publicitario, independiente de Radio Taxi Cádiz y del Ayuntamiento de Cádiz. Toda la información proporcionada es orientativa y recopilada de fuentes públicas. No nos hacemos responsables de posibles modificaciones en las tarifas o variaciones. Recomendamos solicitar el precio final al conductor antes de iniciar el trayecto.</p>
                <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center; font-size: 0.85rem;">
                    <a href="#" style="color: var(--brand-cyan); text-decoration: none;">Aviso Legal</a>
                    <a href="#" style="color: var(--brand-cyan); text-decoration: none;">Política de Privacidad</a>
                    <a href="#" style="color: var(--brand-cyan); text-decoration: none;">Cookies</a>
                </div>
            </div>"""

html = html.replace(old_legal, new_legal)

# 4. Replace floating buttons with Sticky Mobile CTA
old_fab = """    <!-- Botones Flotantes (Solo Móvil) -->
    <div class="fab-container">
        <a href="https://wa.me/34956212121" class="fab-btn fab-whatsapp" aria-label="WhatsApp" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
550:             </svg>
551:         </a>
552:         <a href="tel:+34956212121" class="fab-btn fab-call" aria-label="Llamar">
553:             <i data-lucide="phone"></i>
554:         </a>
555:     </div>"""

new_fab = """    <!-- Sticky Mobile CTA -->
    <div class="sticky-mobile-cta">
        <a href="tel:+34956212121" class="btn btn-glow" style="width: 100%; border-radius: 50px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 15px rgba(0, 210, 255, 0.4);">
            <i data-lucide="phone" size="20"></i> <strong data-translate="sticky-cta">Pedir Taxi Ahora</strong>
        </a>
    </div>"""

html = html.replace(old_fab, new_fab)

# 5. Replace Script Tag
old_script = """    <!-- Script de IA Dinámica, Traducciones y Acordeones -->
    <script src="script.js?v=1.12.0"></script>"""
new_script = """    <!-- Entry point de Módulos ES6 -->
    <script type="module" src="js/main.js?v=1.13.0"></script>"""

html = html.replace(old_script, new_script)

with open(r'c:\Users\frn\Documents\cadiz.taxi\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
