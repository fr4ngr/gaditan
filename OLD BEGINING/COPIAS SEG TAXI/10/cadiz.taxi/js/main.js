import { translations, state, calcContext } from './config.js';
import { calculateRoute } from './pricing.js';
import { 
    setLanguage, 
    updateDynamicAd, 
    toggleTime, 
    toggleFestivo, 
    toggleRenfe, 
    updateLuggage,
    toggleCalcTime,
    toggleCalcFestivo,
    toggleCalcRenfe,
    updateCalcLuggage,
    setupPhotonAutocomplete,
    geolocateOrigin,
    confirmReservation
} from './ui.js';

window.calculateRoute = calculateRoute;
window.toggleTime = toggleTime;
window.toggleFestivo = toggleFestivo;
window.toggleRenfe = toggleRenfe;
window.updateLuggage = updateLuggage;
window.toggleCalcTime = toggleCalcTime;
window.toggleCalcFestivo = toggleCalcFestivo;
window.toggleCalcRenfe = toggleCalcRenfe;
window.updateCalcLuggage = updateCalcLuggage;
window.geolocateOrigin = geolocateOrigin;
window.confirmReservation = confirmReservation;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const savedLang = localStorage.getItem('cadiz_taxi_lang');
    if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
    } else {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('en')) {
            setLanguage('en');
        } else {
            setLanguage('es');
        }
    }

    const esBtn = document.getElementById('lang-es');
    const enBtn = document.getElementById('lang-en');
    
    if (esBtn) esBtn.addEventListener('click', () => setLanguage('es'));
    if (enBtn) enBtn.addEventListener('click', () => setLanguage('en'));

    updateDynamicAd();

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', confirmReservation);
    }

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');
        
        if (toggle && content) {
            toggle.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.faq-content');
                        if (otherContent) otherContent.style.maxHeight = null;
                    }
                });
                
                if (isActive) {
                    item.classList.remove('active');
                    content.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }
    });

    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
        const map = L.map('map').setView([36.516, -6.288], 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        const redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const stops = [
            [36.5352, -6.3042], [36.5321, -6.3024], [36.5313, -6.3053], [36.5330, -6.2985], 
            [36.5304, -6.2982], [36.5320, -6.2964], [36.5350, -6.2915], [36.5429, -6.2800], 
            [36.5349, -6.2923], [36.5293, -6.2952], [36.5289, -6.2914], [36.5278, -6.2892], 
            [36.5283, -6.2870], [36.5268, -6.2845], [36.5265, -6.2895], [36.5231, -6.2842], 
            [36.5195, -6.2815], [36.5167, -6.2770], [36.5148, -6.2749], [36.5115, -6.2733], 
            [36.5098, -6.2729], [36.5170, -6.2620], [36.5010, -6.2698], [36.4998, -6.2716], 
            [36.4980, -6.2682], [36.5058, -6.2625], [36.4975, -6.2710], [36.5057, -6.2756], 
        ];

        stops.forEach(coords => {
            L.marker(coords, { icon: redIcon }).addTo(map);
        });
    }

    setupPhotonAutocomplete('calc-origin', 'origin-suggestions', (data) => calcContext.selectedOrigin = data, true);
    setupPhotonAutocomplete('calc-destination', 'dest-suggestions', (data) => calcContext.selectedDest = data, false);
});

window.addEventListener('scroll', () => {
    const fab = document.querySelector('.fab-container');
    if (fab) {
        if (window.scrollY > 100) {
            fab.classList.add('scrolled');
        } else {
            fab.classList.remove('scrolled');
        }
    }
});
