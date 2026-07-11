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

    // Toggle para las secciones de tarifas (Urbanas/Interurbanas)
    const fareToggles = document.querySelectorAll('.fare-toggle');
    fareToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const group = toggle.closest('.fare-group');
            const icon = toggle.querySelector('.fare-icon');
            const content = group.querySelector('.fare-content');
            
            if (group.classList.contains('active')) {
                group.classList.remove('active');
                if (icon) icon.style.transform = 'rotate(0deg)';
                content.style.maxHeight = '0px';
            } else {
                group.classList.add('active');
                if (icon) icon.style.transform = 'rotate(180deg)';
                content.style.maxHeight = '2000px';
                
                setTimeout(() => {
                    const rect = group.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    if (rect.bottom > viewportHeight) {
                        let offset;
                        if (rect.height > viewportHeight - 80) {
                            offset = window.scrollY + rect.top - 80;
                        } else {
                            offset = window.scrollY + rect.bottom - viewportHeight + 20;
                        }
                        window.scrollTo({ top: offset, behavior: 'smooth' });
                    }
                }, 400); // 400ms to match the CSS transition
            }
        });
    });

    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
        const initMap = () => {
            const map = L.map('map', {
                scrollWheelZoom: false,
                dragging: !L.Browser.mobile,
                tap: false
            }).setView([36.516, -6.288], 13);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 19
            }).addTo(map);
            // Marker code is commented out so map loads without pins by default
            /*
            const redIcon = new L.Icon({...});
            */
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initMap();
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "200px" });
        
        observer.observe(mapElement);
    }

    setupPhotonAutocomplete('calc-origin', 'origin-suggestions', (data) => calcContext.selectedOrigin = data, true);
    setupPhotonAutocomplete('calc-destination', 'dest-suggestions', (data) => calcContext.selectedDest = data, false);
    
    // Auto-GPS UX: Pedir ubicación al hacer click en el input de origen, de forma silenciosa
    const originInput = document.getElementById('calc-origin');
    let hasRequestedGPS = false;
    if (originInput) {
        originInput.addEventListener('click', () => {
            if (!hasRequestedGPS && originInput.value.trim() === '') {
                hasRequestedGPS = true;
                geolocateOrigin();
            }
        });
    }
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
