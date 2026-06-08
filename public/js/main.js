import { translations, state, calcContext } from './config.js';
import { calculateRoute, updateCalcPriceUI } from './pricing.js';
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
    confirmReservation,
    updateBookingStepper,
    toggleBookingPet,
    toggleSupplements,
    toggleCalcSupplements,
    initDynamicHeader,
    openSearchModal,
    closeSearchModal
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
window.toggleSupplements = toggleSupplements;
window.toggleCalcSupplements = toggleCalcSupplements;
window.updateCalcPriceUI = updateCalcPriceUI;
window.geolocateOrigin = geolocateOrigin;
window.confirmReservation = confirmReservation;
window.updateBookingStepper = updateBookingStepper;
window.toggleBookingPet = toggleBookingPet;
window.toggleSupplements = toggleSupplements;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // El header principal ahora es estático.
    const openSearchBtn = document.getElementById('open-search-btn');
    if (openSearchBtn) {
        openSearchBtn.addEventListener('click', () => {
            openSearchModal();
        });
    }

    const closeSearchBtn = document.getElementById('close-search-modal');
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', closeSearchModal);
    }
    
    const searchModalOverlay = document.getElementById('search-modal');
    if (searchModalOverlay) {
        searchModalOverlay.addEventListener('click', (e) => {
            if (e.target === searchModalOverlay) {
                closeSearchModal();
            }
        });
    }

    // Lógica para Accesos Rápidos
    document.querySelectorAll('.quick-action-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            closeSearchModal();
            const targetSelector = pill.getAttribute('data-target');
            const action = pill.getAttribute('data-action');
            
            if (targetSelector) {
                const targetEl = document.querySelector(targetSelector);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            
            if (action === 'open-supplements') {
                setTimeout(() => {
                    const suppContainer = document.getElementById('calc-supplements-container');
                    const suppBtn = document.getElementById('btn-calc-supplements');
                    if (suppContainer && suppContainer.classList.contains('hidden')) {
                        if (window.toggleCalcSupplements) window.toggleCalcSupplements();
                    }
                }, 500); // Dar tiempo al scroll
            }
        });
    });

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
    
    // Listener para el selector de Cuándo (Ahora vs Fecha)
    const whenSelect = document.getElementById('b-when');
    const calcWhenSelect = document.getElementById('calc-when');
    const calcDatetimeContainer = document.getElementById('calc-datetime-container');
    const calcDateInput = document.getElementById('calc-date');
    const calcTimeInput = document.getElementById('calc-time');
    
    if (calcWhenSelect && calcDatetimeContainer) {
        calcWhenSelect.addEventListener('change', (e) => {
            if (e.target.value === 'later') {
                calcDatetimeContainer.classList.remove('hidden');
            } else {
                calcDatetimeContainer.classList.add('hidden');
            }
            if (window.updateCalcPriceUI) window.updateCalcPriceUI();
        });
    }
    
    if (calcDateInput) calcDateInput.addEventListener('change', () => { if (window.updateCalcPriceUI) window.updateCalcPriceUI(); });
    if (calcTimeInput) calcTimeInput.addEventListener('change', () => { if (window.updateCalcPriceUI) window.updateCalcPriceUI(); });

    const dateContainer = document.getElementById('b-date-container');
    const timeContainer = document.getElementById('b-time-container');
    if (whenSelect) {
        whenSelect.addEventListener('change', function() {
            if (this.value === 'later') {
                if (dateContainer) dateContainer.style.display = 'block';
                if (timeContainer) timeContainer.style.display = 'block';
            } else {
                if (dateContainer) dateContainer.style.display = 'none';
                if (timeContainer) timeContainer.style.display = 'none';
                // Limpiamos sus valores para que no interfieran
                const dInput = document.getElementById('b-date');
                const tInput = document.getElementById('b-time');
                if(dInput) dInput.value = '';
                if(tInput) tInput.value = '';
                const dateDisplay = document.getElementById('b-date-display');
                if(dateDisplay) dateDisplay.style.display = 'none';
                if(dInput) {
                    dInput.classList.add('with-icon');
                    dInput.style.color = '';
                    const icon = dInput.parentElement.querySelector('svg') || dInput.parentElement.querySelector('i');
                    if (icon) icon.style.display = 'block';
                }
            }
        });
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

    // ── Animación de entrada + Glow permanente en tarjetas de tarifas ──
    const tarifasCards = document.querySelectorAll('.tarifas-card-hover');

    const activateGlow = (card) => {
        card.classList.add('tarifas-glow-on');
    };

    const triggerPopIn = (card) => {
        card.classList.remove('tarifas-pop-in');
        void card.offsetWidth; // reflow para reiniciar animación
        card.classList.add('tarifas-pop-in');
        // Al terminar la animación, activa el glow permanente
        card.addEventListener('animationend', () => activateGlow(card), { once: true });
    };

    // 1. Tabla urbana: pop-in al entrar en viewport
    const urbanCard = document.querySelector('.pricing-section .tarifas-card-hover');
    if (urbanCard) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    triggerPopIn(urbanCard);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        observer.observe(urbanCard);
    }

    // 2. Tabla interurbana: pop-in al abrir el acordeón
    fareToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const group = toggle.closest('.fare-group');
            if (group && group.classList.contains('active')) {
                const interCard = group.querySelector('.tarifas-card-hover');
                if (interCard && !interCard.classList.contains('tarifas-glow-on')) {
                    setTimeout(() => triggerPopIn(interCard), 50);
                }
            }
        });
    });

    // 3. Tap = refuerzo visual (flash más intenso) + activa glow si aún no está
    tarifasCards.forEach(card => {
        card.addEventListener('touchstart', () => {
            activateGlow(card);
            card.classList.add('tarifas-tap-active');
            setTimeout(() => card.classList.remove('tarifas-tap-active'), 500);
        }, { passive: true });
        card.addEventListener('click', () => {
            activateGlow(card);
        });
    });


    // La inicialización del mapa de paradas ahora se gestiona en mapManager.js


    setupPhotonAutocomplete('calc-origin', 'origin-suggestions', (data) => calcContext.selectedOrigin = data, false);
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
            const numInput = document.getElementById('b-pickup-num');
            if (numInput) {
                if (data && data.isStreet) {
                    numInput.setAttribute('required', 'true');
                    numInput.placeholder = "Nº*";
                } else {
                    numInput.removeAttribute('required');
                    numInput.placeholder = "Nº";
                }
            }
            checkTrain();
        }, false);
        bPickupInput.addEventListener('input', checkTrain);
    }
    if (document.getElementById('b-dropoff')) {
        setupPhotonAutocomplete('b-dropoff', 'b-dropoff-suggestions', (data) => {
            calcContext.bookingDest = data;
            const numInput = document.getElementById('b-dropoff-num');
            if (numInput) {
                if (data && data.isStreet) {
                    numInput.setAttribute('required', 'true');
                    numInput.placeholder = "Nº*";
                } else {
                    numInput.removeAttribute('required');
                    numInput.placeholder = "Nº";
                }
            }
        }, false);
    }
    
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

    // --- Mobile Sticky Bottom Bar Logic ---
    const stickyBar = document.getElementById('mobileStickyBar');
    const heroSection = document.querySelector('.hero');
    if (stickyBar && heroSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If Hero is NOT visible, show the sticky bar
                if (!entry.isIntersecting) {
                    stickyBar.classList.add('visible');
                } else {
                    stickyBar.classList.remove('visible');
                }
            });
        }, {
            // Trigger when only 10% of the hero is visible
            threshold: 0.1
        });
        observer.observe(heroSection);
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
