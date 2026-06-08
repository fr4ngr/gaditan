import { translations, state, routeState, routeData, calcState, calcContext } from './config.js';
import { updatePriceUI, updateCalcPriceUI, calculateRoute, getRouteDetails, calculatePrice, isInterurban } from './pricing.js';
import { geocodeString } from './api.js';

export function updateDynamicAd() {
    const adTitle = document.getElementById('ad-title');
    const adDesc = document.getElementById('ad-desc');
    
    if (!adTitle || !adDesc) return;
    
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    
    if (hour >= 13 && hour < 21) {
        timeOfDay = 'afternoon';
    } else if (hour >= 21 || hour < 7) {
        timeOfDay = 'night';
    }
    
    const titleKey = `ad-title-${timeOfDay}`;
    const descKey = `ad-desc-${timeOfDay}`;
    
    adTitle.innerHTML = translations[state.currentLanguage][titleKey];
    adDesc.innerHTML = translations[state.currentLanguage][descKey];
}

export function toggleSupplements() {
    const container = document.getElementById('supplements-container');
    const btn = document.getElementById('btn-toggle-supplements');
    const icon = document.getElementById('icon-supplements-chevron');
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        btn.classList.add('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'chevron-up');
            if (window.lucide) window.lucide.createIcons();
        }
    } else {
        container.classList.add('hidden');
        btn.classList.remove('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'chevron-down');
            if (window.lucide) window.lucide.createIcons();
        }
    }
}

export function toggleCalcSupplements() {
    const container = document.getElementById('calc-supplements-container');
    const btn = document.getElementById('btn-calc-supplements');
    const icon = document.getElementById('calc-supplements-chevron');
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        btn.classList.add('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'chevron-up');
            if (window.lucide) window.lucide.createIcons();
        }
    } else {
        container.classList.add('hidden');
        btn.classList.remove('active');
        if (icon) {
            icon.setAttribute('data-lucide', 'chevron-down');
            if (window.lucide) window.lucide.createIcons();
        }
    }
}

export function setLanguage(lang) {
    if (!translations[lang]) return;
    state.currentLanguage = lang;
    
    localStorage.setItem('cadiz_taxi_lang', lang);
    
    document.querySelectorAll('[data-translate]').forEach(elem => {
        const key = elem.getAttribute('data-translate');
        if (key === 'ad-title-morning' || key === 'ad-desc-morning') {
            return;
        }
        if (translations[lang][key]) {
            elem.innerHTML = translations[lang][key];
        }
    });
    
    document.querySelectorAll('[data-translate-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-translate-placeholder');
        if (translations[lang][key]) {
            elem.placeholder = translations[lang][key];
        }
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `lang-${lang}`);
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    updateDynamicAd();
    
    Object.keys(routeData).forEach(id => updatePriceUI(id));
}

export function toggleTime(id) {
    routeState[id].isDay = !routeState[id].isDay;
    const btn = document.getElementById('time-toggle-'+id);
    const festivoBtn = document.getElementById('festivo-toggle-'+id);
    
    if (routeState[id].isDay) {
        btn.classList.add('active');
        btn.innerHTML = `<i data-lucide="sun" size="14"></i> <span id="time-text-${id}" data-translate="btn-day">${state.currentLanguage === "es" ? "Día" : "Day"}</span>`;
        if(festivoBtn) festivoBtn.style.display = '';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = `<i data-lucide="moon" size="14"></i> <span id="time-text-${id}" data-translate="btn-night">${state.currentLanguage === "es" ? "Noche" : "Night"}</span>`;
        if(festivoBtn) festivoBtn.style.display = 'none';
    }
    lucide.createIcons();
    updatePriceUI(id);
}

export function toggleFestivo(id) {
    routeState[id].isFestivo = !routeState[id].isFestivo;
    const btn = document.getElementById('festivo-toggle-'+id);
    if (routeState[id].isFestivo) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
    updatePriceUI(id);
}

export function toggleRenfe(id) {
    routeState[id].renfe = !routeState[id].renfe;
    const btn = document.getElementById('renfe-toggle-'+id);
    if (routeState[id].renfe) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
    updatePriceUI(id);
}

export function updateLuggage(id, delta) {
    let newL = routeState[id].luggage + delta;
    if (newL < 0) newL = 0;
    if (newL > 10) newL = 10;
    routeState[id].luggage = newL;
    document.getElementById('luggage-'+id).innerText = newL;
    const container = document.getElementById('maleta-container-'+id);
    if (newL > 0) {
        container.classList.add('active');
    } else {
        container.classList.remove('active');
    }
    updatePriceUI(id);
}

export function toggleCalcTime() {
    calcState.isDay = !calcState.isDay;
    const btn = document.getElementById('calc-time-toggle');
    const festivoBtn = document.getElementById('calc-festivo-toggle');
    
    if (calcState.isDay) {
        btn.classList.add('active');
        btn.innerHTML = `<i data-lucide="sun" size="14"></i> <span id="calc-time-text" data-translate="btn-day">${state.currentLanguage === "es" ? "Día" : "Day"}</span>`;
        if(festivoBtn) festivoBtn.style.display = 'inline-flex';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = `<i data-lucide="moon" size="14"></i> <span id="calc-time-text" data-translate="btn-night">${state.currentLanguage === "es" ? "Noche" : "Night"}</span>`;
        if(festivoBtn) festivoBtn.style.display = 'none';
        calcState.isFestivo = false;
        if(festivoBtn) festivoBtn.classList.remove('active');
    }
    if (window.lucide) window.lucide.createIcons();
    updateCalcPriceUI();
}

export function toggleCalcFestivo() {
    if(!calcState.isDay) return;
    calcState.isFestivo = !calcState.isFestivo;
    document.getElementById('calc-festivo-toggle').classList.toggle('active', calcState.isFestivo);
    updateCalcPriceUI();
}

export function toggleCalcRenfe() {
    calcState.hasRenfe = !calcState.hasRenfe;
    document.getElementById('calc-renfe-toggle').classList.toggle('active', calcState.hasRenfe);
    updateCalcPriceUI();
}

export function updateCalcLuggage(delta) {
    let newL = calcState.luggage + delta;
    if (newL < 0) newL = 0;
    if (newL > 2) newL = 2;
    calcState.luggage = newL;
    document.getElementById('calc-luggage').innerText = newL;
    const container = document.getElementById('calc-maleta-container');
    if (newL > 0) {
        container.classList.add('active');
    } else {
        container.classList.remove('active');
    }
    updateCalcPriceUI();
}

export function updateBookingStepper(type, delta) {
    const input = document.getElementById('chip-' + type);
    const valText = document.getElementById('val-' + type);
    const container = document.getElementById('container-' + type);
    
    let current = parseInt(input.value);
    let max = type === 'passengers' ? 4 : (type === 'luggage' ? 2 : 10);
    let min = type === 'passengers' ? 1 : 0;
    
    let next = current + delta;
    if (next < min) next = min;
    if (next > max) next = max;
    
    input.value = next;
    valText.innerText = next;
}

export function toggleBookingPet() {
    const input = document.getElementById('chip-pet');
    const container = document.getElementById('container-pet');
    
    if (input.value === 'No') {
        input.value = 'Sí';
        container.classList.add('active');
    } else {
        input.value = 'No';
        container.classList.remove('active');
    }
}

export function setupPhotonAutocomplete(inputId, suggestionsId, onSelect, strictCadiz = false) {
    const input = document.getElementById(inputId);
    const suggestionsBox = document.getElementById(suggestionsId);
    let debounceTimer;

    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const val = this.value.trim();
        suggestionsBox.innerHTML = '';
        
        // Evitar búsquedas inútiles de palabras genéricas sueltas (ej: "hotel", "calle")
        const genericWords = ['hotel', 'calle', 'avenida', 'plaza', 'paseo', 'hospital', 'colegio', 'bar', 'restaurante', 'playa'];
        const isGeneric = genericWords.includes(val.toLowerCase());
        
        if (val.length < 3 || isGeneric) {
            suggestionsBox.classList.add('hidden');
            onSelect(null);
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&lat=36.52&lon=-6.29&limit=5`;
                if (strictCadiz) {
                    url += "&bbox=-6.32,36.48,-6.25,36.54";
                }
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.features && data.features.length > 0) {
                    suggestionsBox.classList.remove('hidden');
                    
                    const seen = new Set();
                    let count = 0;
                    
                    const sanitizeStr = (s) => {
                        let clean = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                        clean = clean.replace(/^(calle |c\/ |avenida |av\.|av |plaza |pl\.|pl |paseo |ps\.|glorieta |carril )/, "");
                        return clean.trim();
                    };
                    
                    const searchSanitized = sanitizeStr(val);
                    
                    data.features.forEach(feature => {
                        if (count >= 5) return;
                        
                        const props = feature.properties;
                        const name = props.name || props.street || "";
                        let city = props.city || props.town || props.village || props.county || props.state || "";
                        
                        // Traducir nombres conflictivos del inglés al español si es necesario
                        if (city) {
                            city = city.replace(/Seville/ig, "Sevilla")
                                       .replace(/Andalusia/ig, "Andalucía")
                                       .replace(/Cadiz/ig, "Cádiz");
                        }
                        
                        if (!name) return;
                        
                        const nameSanitized = sanitizeStr(name);
                        if (searchSanitized.length > 0 && !nameSanitized.includes(searchSanitized)) {
                            return; 
                        }
                        
                        if (strictCadiz) {
                            const cityNormalized = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                            if (cityNormalized && cityNormalized !== "cadiz") {
                                return;
                            }
                        }
                        
                        const uniqueKey = name.toLowerCase();
                        if (seen.has(uniqueKey)) return;
                        seen.add(uniqueKey);
                        
                        count++;
                        
                        const type = ""; // Quitamos los emojis horribles
                        const displayName = `<span style="font-weight: 400;">${name}</span> <span style="font-size:0.85em; color:var(--text-muted)">(${city || 'Cádiz'})</span>`;
                        
                        const div = document.createElement('div');
                        div.style.padding = '10px 15px';
                        div.style.cursor = 'pointer';
                        div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                        div.style.fontFamily = 'inherit';
                        div.style.whiteSpace = 'nowrap';
                        div.style.overflow = 'hidden';
                        div.style.textOverflow = 'ellipsis';
                        div.innerHTML = displayName;
                        div.addEventListener('click', () => {
                            input.value = `${name}, ${city || 'Cádiz'}`.replace(/, $/, "");
                            const isStreet = feature.properties.osm_key === 'highway' || feature.properties.type === 'street' || /calle|avenida|plaza|paseo|avda|c\/|pza/i.test(name);
                            onSelect({
                                name: name,
                                city: city || 'Cádiz',
                                lat: feature.geometry.coordinates[1],
                                lon: feature.geometry.coordinates[0],
                                isStreet: isStreet
                            });
                            suggestionsBox.classList.add('hidden');
                        });
                        suggestionsBox.appendChild(div);
                    });
                    
                    if (count === 0) {
                        suggestionsBox.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.9em; text-align: center;">No se han encontrado resultados.</div>';
                        suggestionsBox.classList.remove('hidden');
                    }
                } else {
                    suggestionsBox.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.9em; text-align: center;">No se han encontrado resultados.</div>';
                    suggestionsBox.classList.remove('hidden');
                }
            } catch (e) {
                console.error("Photon API Error:", e);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== suggestionsBox) {
            suggestionsBox.classList.add('hidden');
        }
    });
}

export function geolocateOrigin(inputId = 'calc-origin', numInputId = null) {
    const input = document.getElementById(inputId);

    if (!navigator.geolocation) {
        return;
    }
    
    // Mostramos estado de carga visual en el input
    if (input) {
        input.placeholder = "Buscando tu ubicación...";
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        if (inputId === 'calc-origin') {
            calcState.originLat = lat;
            calcState.originLon = lon;
        }
        try {
            const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                const props = data.features[0].properties;
                const street = props.street || props.name || "Ubicación actual";
                
                if (input) {
                    input.value = `${street}, ${props.city || 'Cádiz'}`.replace(/, $/, "");
                }
                const isStreet = props.osm_key === 'highway' || props.type === 'street' || /calle|avenida|plaza|paseo|avda|c\/|pza/i.test(street);
                
                const locData = {
                    name: street,
                    city: props.city || 'Cádiz',
                    lat: lat,
                    lon: lon,
                    isStreet: isStreet
                };
                
                if (inputId === 'calc-origin') {
                    calcContext.selectedOrigin = locData;
                } else if (inputId === 'b-pickup') {
                    calcContext.bookingOrigin = locData;
                }
                
                if (numInputId) {
                    const numInput = document.getElementById(numInputId);
                    if (numInput) {
                        if (props.housenumber) {
                            numInput.value = props.housenumber;
                        } else {
                            numInput.value = '';
                        }
                        if (isStreet) {
                            numInput.setAttribute('required', 'true');
                            numInput.placeholder = "Nº*";
                        } else {
                            numInput.removeAttribute('required');
                            numInput.placeholder = "Nº";
                        }
                    }
                }
                
                // Check trains
                if (inputId === 'b-pickup') {
                    const bTrainContainer = document.getElementById('b-train-container');
                    const val = input.value.toLowerCase();
                    if (val.includes('renfe') || val.includes('estacion') || val.includes('estación') || val.includes('sevilla') || val.includes('tren')) {
                        if (bTrainContainer) bTrainContainer.classList.remove('hidden');
                    } else {
                        if (bTrainContainer) bTrainContainer.classList.add('hidden');
                    }
                }
            } else {
                if (input && input.value.trim() === '') {
                    input.value = lat.toFixed(4) + ", " + lon.toFixed(4);
                }
                const locData = {
                    name: "Ubicación detectada",
                    city: 'Cádiz',
                    lat: lat,
                    lon: lon
                };
                if (inputId === 'calc-origin') calcContext.selectedOrigin = locData;
                else if (inputId === 'b-pickup') calcContext.bookingOrigin = locData;
            }
        } catch(e) {
            console.error("GPS Error", e);
        } finally {
            if (input && inputId === 'calc-origin') input.placeholder = "Origen (ej. Av. Andalucía)";
            if (input && inputId === 'b-pickup') input.placeholder = "Ej. Hotel Playa Victoria";
            if (window.lucide) window.lucide.createIcons();
        }
    }, () => {
        // Fallo silencioso si deniega el GPS
        if (input && inputId === 'calc-origin') input.placeholder = "Origen (ej. Av. Andalucía)";
        if (input && inputId === 'b-pickup') input.placeholder = "Ej. Hotel Playa Victoria";
    });
}

export async function confirmReservation(event) {
    event.preventDefault();
    let name = document.getElementById('b-name').value;
    name = name.replace(/\b\w/g, c => c.toUpperCase());
    const phone = document.getElementById('b-phone').value;
    
    const when = document.getElementById('b-when').value;
    let date = '';
    let time = '';
    let selectedDateTime = new Date();

    if (when === 'later') {
        date = document.getElementById('b-date').value;
        time = document.getElementById('b-time').value;
        if (!date || !time) {
            alert("Por favor introduce fecha y hora.");
            return false;
        }
        selectedDateTime = new Date(`${date}T${time}`);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 1); // 48h aprox
        minDate.setHours(23, 59, 59, 999);
        
        if (selectedDateTime <= minDate) {
            const alertMsg = state.currentLanguage === 'es'
                ? "Las reservas online solo pueden realizarse con un mínimo de 48h de antelación. Para reservas urgentes, por favor llame por teléfono."
                : "Online bookings can only be made with a minimum of 48h notice. For urgent bookings, please call us.";
            alert(alertMsg);
            return false;
        }
    } else {
        // "Ahora mismo"
        date = selectedDateTime.toISOString().split('T')[0];
        time = selectedDateTime.toTimeString().split(' ')[0].substring(0, 5);
    }
    
    let pickup = document.getElementById('b-pickup').value;
    const pickupNumEl = document.getElementById('b-pickup-num');
    if (pickupNumEl && pickupNumEl.value.trim() !== '') {
        const parts = pickup.split(', ');
        if (parts.length > 1) {
            const city = parts.pop();
            pickup = parts.join(', ') + `, Nº ${pickupNumEl.value.trim()}, ` + city;
        } else {
            pickup += `, Nº ${pickupNumEl.value.trim()}`;
        }
    }
    
    let dropoff = document.getElementById('b-dropoff').value;
    const dropoffNumEl = document.getElementById('b-dropoff-num');
    if (dropoffNumEl && dropoffNumEl.value.trim() !== '') {
        const parts = dropoff.split(', ');
        if (parts.length > 1) {
            const city = parts.pop();
            dropoff = parts.join(', ') + `, Nº ${dropoffNumEl.value.trim()}, ` + city;
        } else {
            dropoff += `, Nº ${dropoffNumEl.value.trim()}`;
        }
    }
    
    // Extraer campos opcionales
    const chipPassengers = document.getElementById('chip-passengers');
    const chipLuggage = document.getElementById('chip-luggage');
    const chipPet = document.getElementById('chip-pet');
    const paymentElement = document.getElementById('b-payment');
    
    const passengers = chipPassengers ? chipPassengers.value : "1";
    const luggage = chipLuggage ? chipLuggage.value : "0";
    const pet = chipPet ? chipPet.value : "No";
    const payment = paymentElement ? paymentElement.value : "Efectivo";
    
    const trainContainer = document.getElementById('b-train-container');
    const trainInput = document.getElementById('b-train');
    let hasRenfe = false;
    let hasPuerto = false;
    let hasCortadura = false;
    
    const pickupLower = pickup.toLowerCase();
    if (pickupLower.includes('renfe') || pickupLower.includes('estacion') || pickupLower.includes('estación') || pickupLower.includes('sevilla') || pickupLower.includes('tren')) {
        hasRenfe = true;
    }
    if (pickupLower.includes('puerto') || pickupLower.includes('maritimo') || pickupLower.includes('marítimo') || pickupLower.includes('crucero') || pickupLower.includes('terminal')) {
        hasPuerto = true;
    }
    if (pickupLower.includes('cortadura')) {
        hasCortadura = true;
    }

    let trainNumberText = "";
    if (trainContainer && !trainContainer.classList.contains('hidden') && trainInput && trainInput.value.trim() !== '') {
        trainNumberText = `\n🚆 Nº de Tren/Vuelo: ${trainInput.value.trim()}`;
    }
    
    const isAdapted = document.getElementById('check-disability') ? document.getElementById('check-disability').checked : false;
    
    // Validar direcciones
    if(!pickup || !dropoff) {
        alert("Por favor introduce origen y destino.");
        return false;
    }

    const formSubmitBtn = document.getElementById('booking-submit-btn');
    const originalBtnText = formSubmitBtn.innerHTML;
    formSubmitBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="animation: spin 1s linear infinite;"></i> Procesando...';
    formSubmitBtn.disabled = true;
    
    try {
        let exactOrigin = calcContext.bookingOrigin;
        if (!exactOrigin || exactOrigin.name !== pickup.split(',')[0]) {
            exactOrigin = await geocodeString(pickup, true) || { name: pickup, city: 'Cádiz', lat: 36.52, lon: -6.29 };
        }
        
        let exactDest = calcContext.bookingDest;
        if (!exactDest || exactDest.name !== dropoff.split(',')[0]) {
            exactDest = await geocodeString(dropoff, false) || { name: dropoff, city: 'Cádiz', lat: 36.52, lon: -6.29 };
        }

        // Determinar hora y si es festivo
        const hour = selectedDateTime.getHours();
        const isNight = (hour >= 21 || hour < 7);
        const dayOfWeek = selectedDateTime.getDay();
        const isFestivo = (dayOfWeek === 0 || dayOfWeek === 6); // Sabado o Domingo
        
        const isInter = isInterurban(exactDest);
        const routeDetails = await getRouteDetails(exactOrigin, exactDest);
        const priceResult = calculatePrice(routeDetails, isNight, isFestivo, hasRenfe, hasPuerto, hasCortadura, isAdapted, parseInt(luggage));
        
        // Rellenar UI del funnel
        document.getElementById('summary-name').innerText = name;
        
        const formattedPhone = phone.replace(/\D/g, '').replace(/(\d{3})(?=\d)/g, '$1 ');
        document.getElementById('summary-phone').innerText = formattedPhone;
        
        document.getElementById('summary-origin').innerText = pickup;
        document.getElementById('summary-dest').innerText = dropoff;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const lang = state.currentLanguage === 'es' ? 'es-ES' : (state.currentLanguage === 'en' ? 'en-US' : (state.currentLanguage === 'fr' ? 'fr-FR' : (state.currentLanguage === 'de' ? 'de-DE' : navigator.language || 'es-ES')));
        const formattedDate = selectedDateTime.toLocaleDateString(lang, options);
        const timeParts = time.split(':');
        document.getElementById('summary-datetime').innerText = `${formattedDate} - ${timeParts[0]}:${timeParts[1]} h`;
        
        let petText = (pet === 'Sí' || pet === 'S' || pet === 'Si' || pet === 'si') ? ', con mascota' : '';
        document.getElementById('summary-details').innerText = `${passengers} pax, ${luggage} maletas${petText}, pago en ${payment}`;
        
        // Asignar precio dinámico a la tarjeta de Taxis Oficiales
        const radioPriceEl = document.getElementById('summary-radio-price');
        if (radioPriceEl) {
            radioPriceEl.innerText = priceResult.price.toFixed(0) + '€';
        }
        
        // Actualizar estadísticas OSRM
        const osrmStatsEl = document.getElementById('summary-osrm-stats');
        const radioTimeEl = document.getElementById('summary-radio-time');
        
        if (routeDetails) {
            const km = routeDetails.finalDistanceKm.toFixed(1).replace('.', ',');
            const mins = Math.ceil(routeDetails.osrmDurationMin);
            
            if (osrmStatsEl) {
                osrmStatsEl.innerText = `Ruta calculada: ${km} km | Tiempo est. ${mins} min`;
                osrmStatsEl.style.display = 'block';
            }
            
            if (radioTimeEl) {
                radioTimeEl.innerHTML = `<i data-lucide="clock" style="width: 14px; height: 14px;"></i> ${mins} min`;
                // Re-inicializar iconos Lucide por si acaso
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }
        
        // Ocultar form, mostrar funnel
        document.getElementById('booking-form').style.display = 'none';
        document.getElementById('booking-results-funnel').style.display = 'block';
        
        // Asignar funciones de botones
        const email = "reservas@radiotaxicadiz.es";
        const subject = state.currentLanguage === 'es' 
            ? `Solicitud de reserva de Taxi - ${name} - ${date}`
            : `Taxi booking request - ${name} - ${date}`;
        
        const body = state.currentLanguage === 'es'
            ? `¡Hola equipo de Taxis Oficiales Cádiz!\n\nSoy ${name} y necesito reservar un taxi con los siguientes detalles:\n\n📱 Teléfono: ${phone}\n📍 Recogida: ${pickup}\n🏁 Destino: ${dropoff}\n📅 Día: ${date}\n⏰ Hora: ${time}${trainNumberText}\n\n👥 Pasajeros: ${passengers}\n🧳 Maletas: ${luggage}\n🐾 Mascota: ${pet}\n💳 Pago: ${payment}\n\nQuedo a la espera de vuestra confirmación. ¡Muchas gracias y un saludo!\n\nAtentamente,\n${name}`
            : `Hello Taxis Oficiales Cádiz team!\n\nMy name is ${name} and I would like to book a taxi with the following details:\n\n📱 Phone: ${phone}\n📍 Pickup: ${pickup}\n🏁 Destination: ${dropoff}\n📅 Date: ${date}\n⏰ Time: ${time}${trainNumberText}\n\n👥 Passengers: ${passengers}\n🧳 Luggage: ${luggage}\n🐾 Pet: ${pet === 'Sí' ? 'Yes' : 'No'}\n💳 Payment: ${payment === 'Efectivo o Tarjeta' ? 'Any' : (payment === 'Tarjeta' ? 'Card' : 'Cash')}\n\nI look forward to your confirmation. Thank you very much!\n\nBest regards,\n${name}`;
        
        const radioEmailBtn = document.getElementById('btn-radio-email');
        if (radioEmailBtn) {
            radioEmailBtn.onclick = function() {
                window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            };
        }
        
        document.getElementById('btn-edit-booking').onclick = function() {
            document.getElementById('booking-results-funnel').style.display = 'none';
            document.getElementById('booking-form').style.display = 'block';
        };

        // Renderizar Mapa
        if (!state.bookingMapInstance) {
            state.bookingMapInstance = L.map('booking-map', {
                zoomControl: false,
                dragging: false,
                touchZoom: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false,
                tap: false
            }).setView([36.52, -6.29], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(state.bookingMapInstance);
            state.bookingMapLayerGroup = L.featureGroup().addTo(state.bookingMapInstance);
        } else {
            state.bookingMapLayerGroup.clearLayers();
        }
        
        const originMarker = L.marker([exactOrigin.lat, exactOrigin.lon]).bindPopup("Origen");
        const destMarker = L.marker([exactDest.lat, exactDest.lon]).bindPopup("Destino");
        state.bookingMapLayerGroup.addLayer(originMarker);
        state.bookingMapLayerGroup.addLayer(destMarker);
        
        if (routeDetails.geometry) {
            const routeLine = L.geoJSON(routeDetails.geometry, {
                style: {
                    color: '#00d2ff',
                    weight: 4,
                    opacity: 0.8
                }
            });
            state.bookingMapLayerGroup.addLayer(routeLine);
        }
        
        setTimeout(() => {
            state.bookingMapInstance.invalidateSize();
            state.bookingMapInstance.fitBounds(state.bookingMapLayerGroup.getBounds(), { padding: [20, 20] });
        }, 100);

    } catch (e) {
        console.error(e);
        alert("Hubo un problema al procesar la ruta. Verifica las direcciones.");
    } finally {
        formSubmitBtn.innerHTML = originalBtnText;
        formSubmitBtn.disabled = false;
        if(window.lucide) window.lucide.createIcons();
    }
    
    return false;
}

