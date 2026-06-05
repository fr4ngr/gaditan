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
    
    // Inicializar campo fecha reservas (mínimo 48h)
    const dateInput = document.getElementById('b-date');
    if (dateInput) {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;
        dateInput.min = minDate;
        
        dateInput.addEventListener('click', function() {
            if (this.showPicker) this.showPicker();
        });
        
        dateInput.addEventListener('change', function() {
            const icon = this.parentElement.querySelector('svg') || this.parentElement.querySelector('i');
            const display = document.getElementById('b-date-display');
            if (this.value) {
                this.classList.remove('with-icon');
                this.style.color = 'transparent';
                if (icon) icon.style.display = 'none';
                if (display) {
                    const parts = this.value.split('-');
                    if (parts.length === 3) display.textContent = `${parts[2]}/${parts[1]}/${parts[0]}`;
                    display.style.display = 'flex';
                }
            } else {
                this.classList.add('with-icon');
                this.style.color = '';
                if (icon) icon.style.display = 'block';
                if (display) display.style.display = 'none';
            }
        });
    }

    const timeInput = document.getElementById('b-time');
    if (timeInput) {
        timeInput.addEventListener('click', function() {
            if (this.showPicker) this.showPicker();
        });
        
        timeInput.addEventListener('change', function() {
            const icon = this.parentElement.querySelector('svg') || this.parentElement.querySelector('i');
            const display = document.getElementById('b-time-display');
            if (this.value) {
                this.classList.remove('with-icon');
                this.style.color = 'transparent';
                if (icon) icon.style.display = 'none';
                if (display) {
                    display.textContent = this.value + 'h';
                    display.style.display = 'flex';
                }
            } else {
                this.classList.add('with-icon');
                this.style.color = '';
                if (icon) icon.style.display = 'block';
                if (display) display.style.display = 'none';
            }
        });
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

    // La inicialización del mapa de paradas ahora se gestiona en mapManager.js

    setupPhotonAutocomplete('calc-origin', 'origin-suggestions', (data) => calcContext.selectedOrigin = data, true);
    setupPhotonAutocomplete('calc-destination', 'dest-suggestions', (data) => calcContext.selectedDest = data, false);
    
    // Autocompletado para el formulario de reservas
    const bPickupInput = document.getElementById('b-pickup');
    if (bPickupInput) {
        const bTrainContainer = document.getElementById('b-train-container');
        const checkTrain = () => {
            const val = bPickupInput.value.toLowerCase();
            if (val.includes('renfe') || val.includes('estacion') || val.includes('estación') || val.includes('sevilla') || val.includes('tren')) {
                bTrainContainer.classList.remove('hidden');
            } else {
                bTrainContainer.classList.add('hidden');
            }
        };
        
        setupPhotonAutocomplete('b-pickup', 'b-pickup-suggestions', (data) => {
            calcContext.bookingOrigin = data;
            checkTrain();
        }, true);
        bPickupInput.addEventListener('input', checkTrain);
    }
    if (document.getElementById('b-dropoff')) {
        setupPhotonAutocomplete('b-dropoff', 'b-dropoff-suggestions', (data) => {
            calcContext.bookingDest = data;
        }, false);
    }
    
    // Lógica de los selects ocultos en los chips
    const hiddenSelects = document.querySelectorAll('.hidden-select');
    hiddenSelects.forEach(select => {
        select.addEventListener('change', function() {
            const type = this.dataset.type;
            const val = this.value;
            const container = this.closest('.select-chip');
            const textSpan = container.querySelector('.chip-text');
            const icon = container.querySelector('.chip-icon');
            
            if (type === 'passengers') {
                textSpan.textContent = val;
                if (val > 1) container.classList.add('active-chip');
                else container.classList.remove('active-chip');
            } else if (type === 'luggage') {
                textSpan.textContent = val;
                if (val > 0) container.classList.add('active-chip');
                else container.classList.remove('active-chip');
            } else if (type === 'pet') {
                textSpan.textContent = val === 'Sí' ? 'Sí' : 'No';
                if (val === 'Sí') container.classList.add('active-chip');
                else container.classList.remove('active-chip');
            }
        });
    });
    
    
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
