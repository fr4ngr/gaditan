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
    "carousel-section-title": "POPULAR TOOLS",
    
    // Calculator
    "calc-title": "Smart Calculator",
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
    "sponsor-sticky-btn": "cadiz.cab",
    
    // Rates/Tarifas
    "day-fare": "Day Rate",
    "day-fare-sub": "Monday to Friday (7am - 9pm)",
    "inter-day-fare-sub": "Monday to Friday (6am - 10pm)",
    "inter-night-fare-sub": "Nights & Holidays",
    "toggle-to-night": "Show Night/Holiday",
    "toggle-to-day": "Show Day Rate",
    "night-fare": "Night & Holiday Rate",
    "night-fare-sub": "Nights, Saturdays, Sundays & Holidays",
    "min-fare": "Minimum fare",
    "flag-drop": "Flag drop rate",
    "price-km": "Price per kilometer",
    "waiting-hour": "Waiting hour rate",
    "supplements-title": "Supplements",
    "supp-train": "Train Station Origin",
    "supp-luggage": "Large Luggage/Item",
    "supp-info-text": "<p style=\"margin-bottom: 0.5rem;\"><strong>¹</strong> This supplement only applies if your trip starts from the Train Station located at Plaza Sevilla. It does not apply if your trip ends at the train station.</p><p><strong>²</strong> Supplement applicable to large suitcases or items. Does not apply to hand luggage/bags, backpacks, walkers, or wheelchairs.</p>",
    "interurban-fares-title": "View Interurban Rates"
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
    
    if (!hasVisited) {
        // Set the flag after 3 seconds so if they bounce immediately it doesn't count
        setTimeout(() => {
            localStorage.setItem('cadiz_visited', 'true');
        }, 3000);
    }
    // 4. Battery Level Detection (if supported)
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryStatus() {
                if (!battery.charging && battery.level <= 0.20) {
                    // Battery is low! Make the main CTA an urgent call button
                    const cta = document.querySelector('.hero-actions .btn-glow');
                    if (cta) {
                        cta.href = "tel:+34956212121";
                        cta.style.animation = 'pulseIcon 1s infinite';
                        cta.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                        cta.style.boxShadow = '0 10px 25px -5px rgba(239, 68, 68, 0.5)';
                        cta.style.borderColor = '#f87171';
                        if (!isForeign) {
                            cta.innerHTML = "<i data-lucide='phone-call'></i> Llama ya (Batería Baja)";
                        } else {
                            cta.innerHTML = "<i data-lucide='phone-call'></i> Call Now (Low Battery)";
                        }
                        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                    }
                }
            }
            updateBatteryStatus();
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingchange', updateBatteryStatus);
        }).catch(() => {
            // Ignore errors if battery API is restricted
        });
    }

    // 5. Connection Speed (reduce animations if slow)
    if (navigator.connection) {
        const speed = navigator.connection.effectiveType;
        if (speed === 'slow-2g' || speed === '2g' || speed === '3g') {
            document.body.classList.add('low-bandwidth');
        }
    }

    // 6. Device Type (iOS vs Android)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
        document.body.classList.add('is-ios');
    }
});
