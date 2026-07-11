// ==========================================
// 1. Traducciones y LocalizaciÃƒÂ³n (i18n)
// ==========================================
const translations = {
    es: {
        "nav-prices": "Precios",
        "nav-booking": "Reservar",
        "nav-stops": "Paradas",
        "nav-faq": "Preguntas",
        "nav-call": "Llama Ya",
        "hero-title": "Taxis Oficiales <br>de Cádiz",
        "hero-subtitle": "Pide un taxi, resérvalo o consulta las tarifas. Toda la info que necesitas en cadiz.taxi",
        "hero-call-btn": "<i data-lucide=\"phone\"></i> &iexcl;LLAMA YA!",
        "badge-official": "Autorizados",
        "badge-receipt": "Factura",
        "badge-card": "Tarjeta",
        "badge-24h": "24 Horas",
        "badge-adapted": "Adaptados",
        "badge-eurotaxi": "8 Plazas",
        "bizum-banner": "La inmensa mayorÃ­a de taxistas de Cádiz aceptan <strong>Bizum</strong>. ¡Súper cómodo!",
        "ad-badge": "Patrocinado Ã‚Â· CádizPass",
        "ad-btn-text": "Ver Tarjeta CadizPass",
        "pricing-title": "Tarifas Oficiales",
        "pricing-update": "Actualizado a Mayo 2026",
        "day-fare": "Día",
        "day-fare-sub": "L-V<br>(7h - 21h)",
        "inter-day-fare-sub": "L-V<br>(6h - 22h)",
        "inter-night-fare-sub": "Noches<br>y Festivos",

        "night-fare": "Noche",
        "night-fare-sub": "Noches<br>y Festivos",
        "min-fare": "Carrera mínima",
        "flag-drop": "Bajada de bandera",
        "price-km": "Precio kilómetro",
        "waiting-hour": "Hora de espera",
        "supplements-title": "Suplementos",
        "supp-train": "Salida Renfe <sup>1</sup>",
        "supp-luggage": "Maleta grande <sup>2</sup>",
        "supp-info-text": "<p style=\"margin-bottom: 0.5rem;\"><strong>¹ Salida Renfe:</strong> Se aplica exclusivamente a viajes con origen en la parada de la estación de tren. No se cobra si tu destino es la estación.</p><p><strong>² Maleta grande:</strong> Aplicable a bultos que superen los 60 cm. Totalmente exentos: sillas de ruedas, andadores y carritos de bebé/compra.</p>",
        "popular-destinations": "Trayectos Populares",
        "dest-from": "DESDE CÁDIZ A",
        "price-disclaimer": "Precio apróximado calculado con la ruta más corta disponible y las condiciones de tráfico más favorables.",
        "dest-adif-title": "Estación de Tren",
        "dest-adif-time": "15 mins",
        "btn-day": "Día",
        "btn-night": "Noche",
        "btn-festivo": "Festivo",
        "btn-renfe": "Renfe",
        "dest-chiclana-title": "Chiclana (Novo S. Petri)",
        "dest-chiclana-time": "35 mins",
        "dest-conil-title": "Conil de la Frontera",
        "dest-conil-time": "40 mins",
        "dest-jerez-title": "Aeropuerto de Jerez",
        "dest-jerez-time": "35 mins",
        "dest-bahia-title": "Bahía Sur (San Fernando)",
        "dest-bahia-time": "15 mins",
        "dest-sevilla-title": "Aeropuerto de Sevilla",
        "dest-sevilla-time": "1h 15 mins",
        "booking-title": "Reserva tu Taxi",
        "form-name": "Nombre",
        "form-name-placeholder": "Tu nombre",
        "form-date": "Fecha",
        "form-time": "Hora",
        "form-pickup": "Desde",
        "form-pickup-placeholder": "Ej. Hotel Playa Victoria",
        "form-dropoff": "Hasta",
        "form-dropoff-placeholder": "Ej. Aeropuerto de Jerez",
        "form-submit": "Solicitar Reserva",
        "map-title": "Mapa de Paradas",
        "map-badge-stops": "28 paradas oficiales",
        "map-badge-24h": "Servicio 24h",
        "map-badge-coverage": "Cobertura total Cádiz capital",
        "faq-title": "Preguntas Frecuentes del Turista",
        "faq-subtitle": "Todo lo que necesitas saber para moverte por Cádiz en taxi",
        "faq-q1": "¿Se puede pagar con tarjeta de crédito?",
        "faq-a1": "Sí, la gran mayorÃƒÂ­a de taxis en Cádiz están equipados con TPV para aceptar pagos con tarjeta (Visa, Mastercard).",
        "faq-q2": "¿Tengo que pagar suplemento por equipaje?",
        "faq-a2": "El equipaje estándar de mano o maletas habituales no tienen suplemento. Bultos especiales de gran tamaño pueden estar sujetos a suplementos municipales según ordenanza.",
        "faq-q3": "¿Puedo viajar con mi mascota?",
        "faq-a3": "Depende de cada conductor, pero generalmente sÃƒÂ­ si viajan en transportín cerrado adecuado. Los perros de asistencia (perros guía) están siempre garantizados y autorizados por ley.",
        "faq-q4": "¿Emitís factura o recibo oficial?",
        "faq-a4": "Sí, todos los vehículos cuentan con impresora obligatoria para emitir tickets desglosados con impuestos y número de licencia oficial, ideal para justificar tus gastos de empresa.",
        "faq-q5": "¿Cómo identifico a un taxista oficial?",
        "faq-a5": "Por normativa municipal, todos los conductores deben exhibir de forma visible su tarjeta identificativa con nombre y número de licencia, garantizando tu seguridad.",
        "footer-desc": "Directorio turístico independiente para la movilidad en la bahía.",
        "footer-disclaimer": "<strong>Aviso Legal y Exención de Responsabilidad:</strong> cadiz.taxi es un portal web de carácter estrictamente informativo y publicitario, independiente de Radio Taxi Cádiz y del Ayuntamiento de Cádiz. Toda la información proporcionada es orientativa y recopilada de fuentes públicas. No nos hacemos responsables de posibles modificaciones en las tarifas o variaciones. Recomendamos solicitar el precio final al conductor antes de iniciar el trayecto.",
        "footer-copyright": "&copy; 2026 Cádiz.Taxi. Diseñado para deslumbrar.",
        // DinÃƒÂ¡micos del Ad
        "ad-title-morning": "Ã‚Â¡Planifica tu mañana en Cádiz!",
        "ad-desc-morning": "Ahorra tiempo y dinero en museos, monumentos y tours guiados. ¡Muévete por la ciudad con el pase turístico oficial!",
        "ad-title-afternoon": "¿Tarde de turismo o playa?",
        "ad-desc-afternoon": "Disfruta de atardeceres en barco, descuentos en chiringuitos selectos y visitas arqueológicas con tu CádizPass.",
        "ad-title-night": "Cádiz de noche y regreso en taxi",
        "ad-desc-night": "Reserva mesa en los mejores restaurantes locales con descuento y asegura tu trayecto de taxi de vuelta con tranquilidad."
    },
    en: {
        "nav-prices": "Prices",
        "nav-booking": "Book Taxi",
        "nav-stops": "Stops",
        "nav-faq": "FAQ",
        "nav-call": "Call Now",
        "hero-title": "Official Taxis <br>in Cádiz",
        "hero-subtitle": "Call a taxi, book it, or check the rates. All the info you need at cadiz.taxi",
        "hero-call-btn": "<i data-lucide=\"phone\"></i> CALL NOW!",
        "badge-official": "Authorized",
        "badge-receipt": "Invoice",
        "badge-card": "Card",
        "badge-24h": "24 Hours",
        "badge-adapted": "Accessible",
        "badge-eurotaxi": "8 Seats",
        "bizum-banner": "The vast majority of taxis accept <strong>Bizum</strong> for mobile payments. Super convenient!",
        "ad-badge": "Sponsored Ã‚Â· CádizPass",
        "ad-btn-text": "Get CádizPass Card",
        "pricing-title": "Official Rates",
        "pricing-update": "Updated May 2026",
        "day-fare": "Day",
        "day-fare-sub": "Mon-Fri<br>(7am - 9pm)",
        "inter-day-fare-sub": "Mon-Fri<br>(6am - 10pm)",
        "inter-night-fare-sub": "Nights<br>& Holidays",

        "night-fare": "Night",
        "night-fare-sub": "Nights<br>& Holidays",
        "min-fare": "Minimum fare",
        "flag-drop": "Flag drop rate",
        "price-km": "Price per kilometer",
        "waiting-hour": "Waiting hour rate",
        "supplements-title": "Supplements",
        "supp-train": "Train Station Origin <sup>1</sup>",
        "supp-luggage": "Large Luggage <sup>2</sup>",
        "supp-info-text": "<p style=\"margin-bottom: 0.5rem;\"><strong>¹ Train Station:</strong> Applies exclusively to trips originating at the train station taxi stand. Not charged if your destination is the station.</p><p><strong>² Large Luggage:</strong> Applicable to items exceeding 60 cm. Fully exempt: wheelchairs, walkers, and baby/shopping strollers.</p>",
        "popular-destinations": "Popular Routes",
        "dest-from": "FROM CADIZ TO",
        "price-disclaimer": "Approximate price calculated with the shortest available route and the most favorable traffic conditions.",
        "dest-adif-title": "Train Station",
        "dest-adif-time": "15 mins",
        "btn-day": "Day",
        "btn-night": "Night",
        "btn-festivo": "Holiday",
        "btn-renfe": "Train",
        "dest-chiclana-title": "Chiclana (Novo S. Petri)",
        "dest-chiclana-time": "35 mins",
        "dest-conil-title": "Conil de la Frontera",
        "dest-conil-time": "40 mins",
        "dest-jerez-title": "Jerez Airport",
        "dest-jerez-time": "35 mins",
        "dest-bahia-title": "Bahía Sur (San Fernando)",
        "dest-bahia-time": "15 mins",
        "dest-sevilla-title": "Seville Airport",
        "dest-sevilla-time": "1h 15 mins",
        "booking-title": "Book your Taxi",
        "form-name": "Name",
        "form-name-placeholder": "Your name",
        "form-date": "Date",
        "form-time": "Time",
        "form-pickup": "From",
        "form-pickup-placeholder": "E.g., Hotel Playa Victoria",
        "form-dropoff": "To",
        "form-dropoff-placeholder": "E.g., Jerez Airport",
        "form-submit": "Request Booking",
        "map-title": "Stops Map",
        "map-badge-stops": "28 official stops",
        "map-badge-24h": "24h service",
        "map-badge-coverage": "Full coverage in Cádiz city",
        "faq-title": "Frequently Asked Questions for Tourists",
        "faq-subtitle": "Everything you need to know to get around Cádiz by taxi",
        "faq-q1": "Can I pay by credit card?",
        "faq-a1": "Yes, the vast majority of taxis in Cádiz are equipped with POS terminals to accept card payments (Visa, Mastercard).",
        "faq-q2": "Do I have to pay an extra fee for luggage?",
        "faq-a2": "Standard hand luggage or normal suitcases are included free of charge. Special large items might be subject to local municipal supplements according to bylaws.",
        "faq-q3": "Can I travel with my pet?",
        "faq-a3": "It depends on the driver, but generally yes if they travel in an appropriate closed carrier. Assistance dogs (guide dogs) are always guaranteed and allowed by law.",
        "faq-q4": "Do you issue an official invoice or receipt?",
        "faq-a4": "Yes, all vehicles have a mandatory printer to issue itemized tickets with taxes and official license number, ideal for justifying your business expenses.",
        "faq-q5": "How do I identify an official taxi driver?",
        "faq-a5": "By municipal law, all drivers must visibly display their identification card with their name and license number, guaranteeing your safety.",
        "footer-desc": "Independent tourist directory for mobility in the bay.",
        "footer-disclaimer": "<strong>Legal Notice and Disclaimer:</strong> cadiz.taxi is a strictly informative and advertising website, independent from Radio Taxi Cádiz and the Cádiz City Council. All information provided is for guidance only and compiled from public sources. We are not responsible for any changes or variations in fares. We recommend checking the final price with the driver before starting the journey.",
        "footer-copyright": "&copy; 2026 Cádiz.Taxi. Designed to impress.",
        // DinÃƒÂ¡micos del Ad
        "ad-title-morning": "Plan your morning in Cádiz!",
        "ad-desc-morning": "Save time and money on museums, monuments, and guided tours. Explore the city with the official tourist pass!",
        "ad-title-afternoon": "Sightseeing or beach afternoon?",
        "ad-desc-afternoon": "Enjoy sunset boat rides, discounts at selected beach bars, and archaeological visits with your CádizPass.",
        "ad-title-night": "Cádiz by night & safe taxi return",
        "ad-desc-night": "Book a table at the best local restaurants with a discount and secure your taxi ride back with peace of mind."
    }
};

let currentLanguage = 'es';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLanguage = lang;
    
    // Guardar preferencia
    localStorage.setItem('cadiz_taxi_lang', lang);
    
    // Traducir textos estÃƒÂ¡ndar
    document.querySelectorAll('[data-translate]').forEach(elem => {
        const key = elem.getAttribute('data-translate');
        
        // Los dinÃƒÂ¡micos del ad se saltan aquÃƒÂ­ para ser calculados por updateDynamicAd
        if (key === 'ad-title-morning' || key === 'ad-desc-morning') {
            return;
        }
        
        if (translations[lang][key]) {
            elem.innerHTML = translations[lang][key];
        }
    });
    
    // Traducir placeholders de inputs
    document.querySelectorAll('[data-translate-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-translate-placeholder');
        if (translations[lang][key]) {
            elem.placeholder = translations[lang][key];
        }
    });
    
    // Actualizar el estado de los botones del selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `lang-${lang}`);
    });
    
    // Re-inicializar iconos de Lucide (ya que se reemplazaron los contenedores con innerHTML)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Actualizar el ad dinámico para reflejar el idioma actual
    updateDynamicAd();
    
    // Actualizar botones de precios
    if (typeof routeData !== 'undefined') {
        Object.keys(routeData).forEach(id => updatePriceUI(id));
    }
}

// ==========================================
// 2. MÃƒÂ³dulo de Publicidad DinÃƒÂ¡mica (Temporal)
// ==========================================
function updateDynamicAd() {
    const adTitle = document.getElementById('ad-title');
    const adDesc = document.getElementById('ad-desc');
    
    if (!adTitle || !adDesc) return;
    
    const hour = new Date().getHours();
    let timeOfDay = 'morning'; // 07:00 - 13:00
    
    if (hour >= 13 && hour < 21) {
        timeOfDay = 'afternoon';
    } else if (hour >= 21 || hour < 7) {
        timeOfDay = 'night';
    }
    
    // Traducir
    const titleKey = `ad-title-${timeOfDay}`;
    const descKey = `ad-desc-${timeOfDay}`;
    
    adTitle.innerHTML = translations[currentLanguage][titleKey];
    adDesc.innerHTML = translations[currentLanguage][descKey];
}

// InicializaciÃƒÂ³n de Eventos y MÃƒÂ³dulos
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Inicializar idioma por defecto o guardado
    const savedLang = localStorage.getItem('cadiz_taxi_lang');
    if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
    } else {
        // Autodetectar idioma del navegador (ES o EN)
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('en')) {
            setLanguage('en');
        } else {
            setLanguage('es');
        }
    }

    // Registrar oyentes del selector de idiomas
    const esBtn = document.getElementById('lang-es');
    const enBtn = document.getElementById('lang-en');
    
    if (esBtn) esBtn.addEventListener('click', () => setLanguage('es'));
    if (enBtn) enBtn.addEventListener('click', () => setLanguage('en'));

    // 3. Inicializar Ad Patrocinado DinÃƒÂ¡mico
    updateDynamicAd();

    // 4. MÃƒÂ³dulo de Reservas (IntegraciÃƒÂ³n Email)
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const confirmMsg = currentLanguage === 'es' 
                ? "Aviso importante: Tienes que esperar a que te confirmemos la reserva. ¿Estás de acuerdo?" 
                : "Important notice: You must wait for us to confirm your booking. Do you agree?";
            
            if (!window.confirm(confirmMsg)) {
                return;
            }
            
            const name = document.getElementById('b-name').value;
            const date = document.getElementById('b-date').value;
            const time = document.getElementById('b-time').value;
            const pickup = document.getElementById('b-pickup').value;
            const dropoff = document.getElementById('b-dropoff').value;
            
            const email = "contacto@radiotaxicadiz.es";
            
            // Textos segÃƒÂºn idioma activo
            const subject = currentLanguage === 'es' 
                ? `Solicitud de reserva de Taxi - ${name} - ${date}`
                : `Taxi booking request - ${name} - ${date}`;
            
            const body = currentLanguage === 'es'
                ? `Ã‚Â¡Hola equipo de Radio Taxi CÃƒÂ¡diz!\n\nSoy ${name} y necesito reservar un taxi con los siguientes detalles:\n\nÃ°Å¸â€œ  Recogida: ${pickup}\nÃ°Å¸   Destino: ${dropoff}\nÃ°Å¸â€œâ€¦ DÃƒÂ­a: ${date}\nÃ¢ Â° Hora: ${time}\n\nQuedo a la espera de vuestra confirmaciÃƒÂ³n. Ã‚Â¡Muchas gracias y un saludo!\n\nAtentamente,\n${name}`
                : `Hello Radio Taxi CÃƒÂ¡diz team!\n\nMy name is ${name} and I would like to book a taxi with the following details:\n\nÃ°Å¸â€œ  Pickup: ${pickup}\nÃ°Å¸   Destination: ${dropoff}\nÃ°Å¸â€œâ€¦ Date: ${date}\nÃ¢ Â° Time: ${time}\n\nI look forward to your confirmation. Thank you very much!\n\nBest regards,\n${name}`;
            
            // Redirigir al cliente de correo del usuario
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }

    // 5. MÃƒÂ³dulo de AcordeÃƒÂ³n de FAQs
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');
        
        if (toggle && content) {
            toggle.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Cerrar todos los demÃƒÂ¡s acordeones abiertos
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.faq-content');
                        if (otherContent) otherContent.style.maxHeight = null;
                    }
                });
                
                // Alternar estado del actual
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

    // 6. MÃƒÂ³dulo de Mapa Interactivo (Leaflet)
    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
        // Inicializar mapa centrado en CÃƒÂ¡diz capital
        const map = L.map('map').setView([36.516, -6.288], 13);
        
        // Capa base clara de Voyager (Estilo moderno)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        // Icono rojo estÃƒÂ¡ndar
        const redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // 28 Paradas - Coordenadas exactas verificadas
        const stops = [
            // Casco HistÃƒÂ³rico
            [36.5352, -6.3042], // AtlÃƒÂ¡ntico Ã¢â‚¬â€œ Av. Doctor GÃƒÂ³mez Ulla (junto al Parador)
            [36.5321, -6.3024], // Falla Ã¢â‚¬â€œ Plaza de Falla 4 (frente al Teatro)
            [36.5313, -6.3053], // Mora Ã¢â‚¬â€œ Glorieta Carlos Cano (Av. Duque de NÃƒÂ¡jera)
            [36.5330, -6.2985], // San Antonio Ã¢â‚¬â€œ Plaza de San Antonio
            [36.5304, -6.2982], // Mercado Ã¢â‚¬â€œ Plaza Libertad (Mercado Central)
            [36.5320, -6.2964], // Palillero Ã¢â‚¬â€œ Plaza del Palillero
            [36.5350, -6.2915], // DiputaciÃƒÂ³n Ã¢â‚¬â€œ Plaza de las Tortugas
            [36.5429, -6.2800], // La Punta Ã¢â‚¬â€œ Paseo Almirante Pascual Pery (nocturna)
            [36.5349, -6.2923], // Comes Ã¢â‚¬â€œ Plaza de la Hispanidad
            
            // Centro, Puerto y Estaciones
            [36.5293, -6.2952], // Catedral Ã¢â‚¬â€œ Plaza de la Catedral
            [36.5289, -6.2914], // San Juan de Dios Ã¢â‚¬â€œ Plaza San Juan de Dios
            [36.5278, -6.2892], // Palacio de Congresos Ã¢â‚¬â€œ Calle LÃƒÂ¡zaro Dou
            [36.5283, -6.2870], // Aduana Ã¢â‚¬â€œ Plaza de Sevilla
            [36.5268, -6.2845], // EstaciÃƒÂ³n Ã¢â‚¬â€œ Av. de Astilleros (Adif/Renfe)
            [36.5265, -6.2895], // Caja Nacional Ã¢â‚¬â€œ Murallas de San Roque 10
            
            // Extramuros Zona Norte
            [36.5231, -6.2842], // Hotel Husa/Puertatierra Ã¢â‚¬â€œ Av. de AndalucÃƒÂ­a 34
            [36.5195, -6.2815], // PabellÃƒÂ³n Ã¢â‚¬â€œ Calle Brunete (Plaza Miguel HernÃƒÂ¡ndez)
            [36.5167, -6.2770], // Las Cortes Ã¢â‚¬â€œ Av. Las Cortes de CÃƒÂ¡diz (El Corte InglÃƒÂ©s)
            [36.5148, -6.2749], // Bar Parada Ã¢â‚¬â€œ Av. Guadalquivir 23
            [36.5115, -6.2733], // Hotel BarcelÃƒÂ³ Ã¢â‚¬â€œ Av. de AndalucÃƒÂ­a 89
            [36.5098, -6.2729], // Camelia Ã¢â‚¬â€œ Av. Ana de Viya 7
            
            // Extramuros Zona Sur y Estadio
            [36.5170, -6.2620], // Barriada Ã¢â‚¬â€œ Av. Guadalete esq. Av. Guadalquivir
            [36.5010, -6.2698], // Residencia Ã¢â‚¬â€œ Av. Cayetano del Toro 1 (H. Puerta del Mar)
            [36.4998, -6.2716], // Mercadona Ã¢â‚¬â€œ Av. de la IlustraciÃƒÂ³n 1
            [36.4980, -6.2682], // Canary Ã¢â‚¬â€œ Av. Cayetano del Toro 21
            [36.5058, -6.2625], // Helios Ã¢â‚¬â€œ Glorieta Helios
            [36.4975, -6.2710], // Piscina/Cortadura Ã¢â‚¬â€œ Calle Zarza
            [36.5057, -6.2756], // Zona Franca Ã¢â‚¬â€œ Glorieta de la Zona Franca
        ];

        // AÃƒÂ±adir pines sin popups
        stops.forEach(coords => {
            L.marker(coords, { icon: redIcon }).addTo(map);
        });
    }
});

// Constantes de rutas con distancias (km) y tiempos (minutos)
// Origen asumido: La Caleta (punto mÃ¡s lejano para garantizar precio mÃ¡ximo sin sorpresas)
const routeData = {
    'adif': { type: 'urban', distUrban: 3.5, distInter: 0, waitMins: 5 },
    'chiclana': { type: 'interurban', distUrban: 6.5, distInter: 28.0, waitMins: 8 },
    'conil': { type: 'interurban', distUrban: 6.5, distInter: 42.0, waitMins: 8 },
    'jerez': { type: 'interurban', distUrban: 4.5, distInter: 39.0, waitMins: 5 },
    'bahia': { type: 'interurban', distUrban: 6.5, distInter: 9.0, waitMins: 8 },
    'sevilla': { type: 'interurban', distUrban: 4.5, distInter: 120.0, waitMins: 5 }
};

const routeState = {
    'adif': { isDay: true, renfe: false, luggage: 0, isFestivo: false },
    'chiclana': { isDay: true, renfe: false, luggage: 0, isFestivo: false },
    'conil': { isDay: true, renfe: false, luggage: 0, isFestivo: false },
    'jerez': { isDay: true, renfe: false, luggage: 0, isFestivo: false },
    'bahia': { isDay: true, renfe: false, luggage: 0, isFestivo: false },
    'sevilla': { isDay: true, renfe: false, luggage: 0, isFestivo: false }
};

// Tarifas Urbanas (Tarifa 1 DÃ­a / Tarifa 2 Noche/Festivo)
const urbanRates = {
    day: { flag: 1.39, km: 0.70, waitHour: 18.97 },
    night: { flag: 1.73, km: 0.90, waitHour: 23.66 }
};

// Tarifas Interurbanas (Tarifa 7 DÃ­a / Tarifa 8 Noche/Festivo)
const interurbanRates = {
    day: { flag: 3.66, km: 0.71, waitHour: 17.57 },
    night: { flag: 3.60, km: 0.82, waitHour: 20.71 }
};

const supplements = {
    luggage: 0.51,
    renfe: 0.82
};

function updatePriceUI(id) {
    if(!document.getElementById('price-'+id)) return;
    const st = routeState[id];
    const data = routeData[id];
    
    // Determinar si aplica tarifa de noche/festivo o de dÃ­a
    const isNightOrFestivo = (!st.isDay || st.isFestivo);
    
    // Seleccionar tarifas correspondientes
    const activeUrbanRate = isNightOrFestivo ? urbanRates.night : urbanRates.day;
    const activeInterRate = isNightOrFestivo ? interurbanRates.night : interurbanRates.day;
    
    // 1. Coste Urbano (Aplicable siempre al inicio desde La Caleta hasta el lÃ­mite municipal)
    let costeUrbano = activeUrbanRate.flag + 
                      (data.distUrban * activeUrbanRate.km) + 
                      ((data.waitMins / 60) * activeUrbanRate.waitHour);
                      
    // 2. Coste Interurbano (Desde el lÃ­mite municipal hasta el destino)
    let costeInterurbano = 0;
    if (data.type === 'interurban') {
        costeInterurbano = (data.distInter * activeInterRate.km);
    }
    
    // 3. Suplementos Urbanos
    let costeSuplementos = (st.luggage * supplements.luggage) + (st.renfe ? supplements.renfe : 0);
    
    let total = costeUrbano + costeInterurbano + costeSuplementos;
    
    let formattedTotal = Math.round(total).toString();
    document.getElementById('price-'+id).innerText = formattedTotal + '\u20AC';
}

function toggleTime(id) {
    routeState[id].isDay = !routeState[id].isDay;
    const btn = document.getElementById('time-toggle-'+id);
    const festivoBtn = document.getElementById('festivo-toggle-'+id);
    
    if (routeState[id].isDay) {
        btn.classList.add('active');
        btn.innerHTML = '<i data-lucide="sun" size="14"></i> <span id="time-text-'+id+'" data-translate="btn-day">' + (currentLanguage === "es" ? "Día" : "Day") + '</span>';
        if(festivoBtn) festivoBtn.style.display = '';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i data-lucide="moon" size="14"></i> <span id="time-text-'+id+'" data-translate="btn-night">' + (currentLanguage === "es" ? "Noche" : "Night") + '</span>';
        if(festivoBtn) festivoBtn.style.display = 'none';
    }
    lucide.createIcons();
    updatePriceUI(id);
}

function toggleFestivo(id) {
    routeState[id].isFestivo = !routeState[id].isFestivo;
    const btn = document.getElementById('festivo-toggle-'+id);
    if (routeState[id].isFestivo) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
    updatePriceUI(id);
}

function toggleRenfe(id) {
    routeState[id].renfe = !routeState[id].renfe;
    const btn = document.getElementById('renfe-toggle-'+id);
    if (routeState[id].renfe) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
    updatePriceUI(id);
}

function updateLuggage(id, delta) {
    let newL = routeState[id].luggage + delta;
    if (newL < 0) newL = 0;
    if (newL > 10) newL = 10;
    routeState[id].luggage = newL;
    document.getElementById('luggage-'+id).innerText = newL;
    updatePriceUI(id);
}




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
// --- CALCULADORA DE TARIFAS ---
let calcState = { isDay: true, isFestivo: false };

function setCalcTime(isDay) {
    calcState.isDay = isDay;
    document.getElementById('calc-btn-day').classList.toggle('active', isDay);
    document.getElementById('calc-btn-night').classList.toggle('active', !isDay);
    
    if (!isDay) {
        document.getElementById('calc-btn-festivo').classList.remove('active');
        calcState.isFestivo = false;
        document.getElementById('calc-btn-festivo').style.opacity = '0.5';
        document.getElementById('calc-btn-festivo').style.pointerEvents = 'none';
    } else {
        document.getElementById('calc-btn-festivo').style.opacity = '1';
        document.getElementById('calc-btn-festivo').style.pointerEvents = 'auto';
    }
}

function toggleCalcFestivo() {
    if(!calcState.isDay) return;
    calcState.isFestivo = !calcState.isFestivo;
    document.getElementById('calc-btn-festivo').classList.toggle('active', calcState.isFestivo);
}

async function geocode(query) {
    try {
        const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query));
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
        }
    } catch(e) {}
    return null;
}

window.calculateRoute = async function() {
    const origin = document.getElementById('calc-origin').value;
    const dest = document.getElementById('calc-destination').value;
    const errorDiv = document.getElementById('calc-error');
    const resultDiv = document.getElementById('calc-result');
    const loadingDiv = document.getElementById('calc-loading');
    
    if (!origin || !dest) {
        errorDiv.style.display = 'block';
        document.getElementById('calc-error-text').innerText = (currentLanguage === 'es') ? 'Por favor, introduce origen y destino.' : 'Please enter origin and destination.';
        resultDiv.style.display = 'none';
        return;
    }
    
    errorDiv.style.display = 'none';
    resultDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
    
    try {
        const originCoords = await geocode(origin + ', Cádiz, Spain');
        const destCoords = await geocode(dest + ', Cádiz, Spain');
        
        if (!originCoords || !destCoords) {
            throw new Error((currentLanguage === 'es') ? 'No se encontraron las ubicaciones.' : 'Locations not found.');
        }
        
        const osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + originCoords.lon + ',' + originCoords.lat + ';' + destCoords.lon + ',' + destCoords.lat + '?overview=false';
        const routeRes = await fetch(osrmUrl);
        const routeData = await routeRes.json();
        
        if (routeData.code !== 'Ok') {
            throw new Error((currentLanguage === 'es') ? 'Error al calcular la ruta.' : 'Error calculating route.');
        }
        
        const distanceKm = routeData.routes[0].distance / 1000;
        
        // Precios
        const bajadaBandera = 1.65; 
        const pricePerKm = 1.10; 
        
        let basePrice = bajadaBandera + (distanceKm * pricePerKm);
        
        if (!calcState.isDay || calcState.isFestivo) {
            basePrice = basePrice * 1.25;
        }
        
        const formattedPrice = basePrice.toFixed(2).replace('.', ',');
        const formattedDist = distanceKm.toFixed(1).replace('.', ',');
        
        document.getElementById('calc-dist-val').innerText = formattedDist + ' km';
        document.getElementById('calc-price-val').innerText = '~\u20AC' + formattedPrice;
        
        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        
    } catch (e) {
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        document.getElementById('calc-error-text').innerText = e.message;
    }
}


