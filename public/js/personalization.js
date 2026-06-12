// public/js/personalization.js

const translationsEN = {
    // Header
    "nav-prices": "Official Prices",
    "nav-booking": "Fare Calculator",
    "nav-stops": "Taxi Ranks Map",
    "nav-faq": "FAQ",
    
    // Hero
    "hero-pretitle": "THE BEST INFO GUIDE FOR",
    "hero-title": "Official Taxis <br>in Cádiz",
    "hero-subtitle": "Order a taxi, estimate fares or find the nearest rank. All the info you need at cadiz.taxi",
    
    // Calculator
    "calc-title": "Smart Taximeter",
    "calc-subtitle": "Calculate your estimated fare instantly",
    "calc-dist": "Distance:",
    "calc-time": "Time:",
    "calc-cerrado-title": "<i data-lucide='shield-check'></i> Legal Fixed Price",
    "calc-cerrado-desc": "If you book online. Immune to traffic jams.",
    "calc-btn-book": "Lock Price Now",
    "calc-street-title": "<i data-lucide='calculator'></i> Street Taximeter",
    "calc-street-desc": "Estimation includes approx. extra cost for traffic according to official BOJA rates.",
    
    // Destinos
    "frequent-destinations": "Airport Transfers",
    "frequent-destinations-sub": "Direct connections to airports: The most comfortable way to arrive.",
    "popular-destinations": "Popular Destinations",
    "popular-destinations-sub": "The most requested trips by our customers from Cádiz",
    
    // Map
    "map-title": "Taxi Ranks Map",
    "stops-map-sub": "Find the closest official taxi rank to your current location.",
    
    // FAQ
    "faq-title": "F.A.Q.",
    "faq-subtitle": "Everything you need to know about taking a taxi in Cádiz",
    
    // Footer
    "footer-desc": "Independent tourist directory for mobility in the bay.",
    "footer-copyright": "&copy; 2026 Cádiz.Taxi. Designed to dazzle.",
    "sponsor-sticky-btn": "cadiz.cab"
};

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Language Detection & Translation
    const userLang = navigator.language || navigator.userLanguage;
    const isForeign = userLang.toLowerCase().startsWith('en') || userLang.toLowerCase().startsWith('de');
    
    if (isForeign) {
        // Change language toggle UI
        const langIcon = document.getElementById('current-lang-icon');
        if (langIcon) langIcon.textContent = '🇬🇧';
        
        const btnEs = document.getElementById('lang-es');
        const btnEn = document.getElementById('lang-en');
        if (btnEs && btnEn) {
            btnEs.classList.remove('active');
            btnEn.classList.add('active');
        }

        // Apply translations
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translationsEN[key]) {
                el.innerHTML = translationsEN[key];
            }
        });
        
        // Re-init lucide icons if any were replaced in innerHTML
        if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
        }
    }

    // 2. Time of Day Context
    const currentHour = new Date().getHours();
    const heroTitle = document.getElementById('hero-title');
    
    // Only modify if we are in Spanish (to keep it simple, or we can translate it too)
    if (!isForeign && heroTitle) {
        if (currentHour >= 23 || currentHour < 6) {
            // Madrugada: 23:00 - 05:59
            heroTitle.innerHTML = "Servicio de Taxi <br><span style='color: var(--brand-cyan);'>24 Horas</span>";
        } else if (currentHour >= 6 && currentHour < 11) {
            // Mañana: 06:00 - 10:59
            heroTitle.innerHTML = "Viaja al Trabajo <br>o Estación";
        }
    }

    // 3. Returning Visitor Logic (localStorage)
    const hasVisited = localStorage.getItem('cadiz_visited');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (hasVisited) {
        // Hide the subtitle to make the UI ultra minimal for returning users
        if (heroSubtitle) {
            heroSubtitle.style.display = 'none';
        }
    } else {
        // Set the flag after 3 seconds so if they bounce immediately it doesn't count
        setTimeout(() => {
            localStorage.setItem('cadiz_visited', 'true');
        }, 3000);
    }
});
