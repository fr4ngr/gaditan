import { translations, state, routeState, routeData, calcState, calcContext } from './config.js';
import { updatePriceUI, updateCalcPriceUI, calculateRoute, getRouteDetails, calculatePrice, isInterurban, determineTariffMode } from './pricing.js';
import { geocodeString } from './api.js';

// Lógica del header dinámico eliminada a petición del usuario para simplificar.
export function openSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.classList.add('active');
        const input = document.getElementById('predictive-search-input');
        if (input) setTimeout(() => input.focus(), 100);
        // Asegurarnos de que el header se queda en modo Nav si lo cerramos después
        const searchState = document.getElementById('header-state-search');
        if (searchState) {
            searchState.style.opacity = '0';
            searchState.style.pointerEvents = 'none';
            document.getElementById('header-state-nav').style.opacity = '1';
            document.getElementById('header-state-nav').style.pointerEvents = 'auto';
        }
    }
}

export function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

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
    if (newL > 4) newL = 4;
    calcState.luggage = newL;
    document.getElementById('calc-luggage').innerText = newL;
    const container = document.getElementById('calc-maleta-container');
    if (container) {
        if (newL > 0) container.classList.add('active');
        else container.classList.remove('active');
    }
    if(window.triggerAutoCalc) window.triggerAutoCalc();
}

export function updateCalcExtraPlaza(delta) {
    let newP = (calcState.extraPlaza || 0) + delta;
    if (newP < 0) newP = 0;
    if (newP > 3) newP = 3; // Up to 3 extra plazas (5th, 6th, 7th passenger over 4)
    calcState.extraPlaza = newP;
    const el = document.getElementById('calc-extra-plaza');
    if (el) el.innerText = newP;
    if(window.triggerAutoCalc) window.triggerAutoCalc();
}

export function updateBookingStepper(type, delta) {
    const input = document.getElementById('chip-' + type);
    const valText = document.getElementById('val-' + type);
    const container = document.getElementById('container-' + type);
    
    let current = parseInt(input.value);
    let max = type === 'passengers' ? 7 : (type === 'luggage' ? 4 : 10);
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
        
        // Extraer el numero de forma segura sin caracteres raros
        let searchVal = val;
        let extractedNumber = "";
        const numRegex = /(?:n\u00BA|n|numero|num)?\s*(\d+[a-zA-Z]?)\s*(?:,.*)?$/i;
        const match = val.match(numRegex);
        
        if (match && match[1]) {
            extractedNumber = match[1];
            // Tambien quitamos la coma si la puso antes del numero
            searchVal = val.replace(numRegex, '').replace(/,$/, '').trim();
        }
        
        const genericWords = ['hotel', 'calle', 'avenida', 'plaza', 'paseo', 'hospital', 'colegio', 'bar', 'restaurante', 'playa'];
        const isGeneric = genericWords.includes(searchVal.toLowerCase());
        
        if (searchVal.length < 3 || isGeneric) {
            suggestionsBox.classList.add('hidden');
            onSelect(null);
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const photonLang = ['en', 'de', 'fr', 'it'].includes(state.currentLanguage) ? state.currentLanguage : 'default';
                let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchVal)}&lat=36.52&lon=-6.29&limit=5&lang=${photonLang}`;
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
                    
                    // Comparamos siempre SIN numeros
                    const searchSanitized = sanitizeStr(searchVal).replace(/\d+/g, '').trim();
                    
                    data.features.forEach(feature => {
                        if (count >= 5) return;
                        
                        const props = feature.properties;
                        const name = props.name || props.street || "";
                        let city = props.city || props.town || props.village || props.county || props.state || "";
                        
                        if (city && state.currentLanguage === 'es') {
                            city = city.replace(/Seville/ig, "Sevilla").replace(/Andalusia/ig, "Andalucía").replace(/Cadiz/ig, "Cádiz");
                        }
                        
                        if (!name) return;
                        
                        const nameSanitized = sanitizeStr(name).replace(/\d+/g, '').trim();
                        
                        if (searchSanitized.length > 0 && !nameSanitized.includes(searchSanitized) && !searchSanitized.includes(nameSanitized)) {
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
                            // MOSTRAR NUMERO EN EL INPUT!
                            const finalAddress = extractedNumber ? `${name} ${extractedNumber}, ${city || 'Cádiz'}` : `${name}, ${city || 'Cádiz'}`;
                            input.value = finalAddress;
                            
                            if (extractedNumber) {
                                let numInputId = null;
                                if (inputId === 'calc-origin') numInputId = 'calc-origin-num';
                                else if (inputId === 'calc-destination') numInputId = 'calc-dest-num';
                                else if (inputId === 'b-pickup') numInputId = 'b-pickup-num';
                                else if (inputId === 'b-dropoff') numInputId = 'b-dropoff-num';
                                
                                if (numInputId) {
                                    const numInput = document.getElementById(numInputId);
                                    if (numInput) {
                                        numInput.value = extractedNumber;
                                        numInput.dispatchEvent(new Event('input'));
                                    }
                                }
                            }
                            
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
                console.error(e);
            }
        }, 500);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
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
                if (inputId === 'calc-origin') { calcContext.selectedOrigin = locData; if(window.triggerAutoCalc) window.triggerAutoCalc(); }
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
    
    // Recopilar datos del formulario
    let name = document.getElementById('b-name')?.value || '';
    name = name.replace(/\b\w/g, c => c.toUpperCase());
    const phone = document.getElementById('b-phone')?.value || '';
    
    const date = document.getElementById('b-date')?.value || '';
    const time = document.getElementById('b-time')?.value || '';
    
    if (!date || !time) {
        alert(state.currentLanguage === 'es' ? "Por favor introduce fecha y hora." : "Please enter date and time.");
        return false;
    }
    
    let pickup = document.getElementById('b-pickup')?.value || '';
    const pickupNumEl = document.getElementById('b-pickup-num');
    if (pickupNumEl && pickupNumEl.value.trim() !== '') {
        const parts = pickup.split(', ');
        if (parts.length > 1) {
            const city = parts.pop();
            pickup = parts.join(', ') + `, N° ${pickupNumEl.value.trim()}, ` + city;
        } else {
            pickup += `, N° ${pickupNumEl.value.trim()}`;
        }
    }
    
    let dropoff = document.getElementById('b-dropoff')?.value || '';
    const dropoffNumEl = document.getElementById('b-dropoff-num');
    if (dropoffNumEl && dropoffNumEl.value.trim() !== '') {
        const parts = dropoff.split(', ');
        if (parts.length > 1) {
            const city = parts.pop();
            dropoff = parts.join(', ') + `, N° ${dropoffNumEl.value.trim()}, ` + city;
        } else {
            dropoff += `, N° ${dropoffNumEl.value.trim()}`;
        }
    }
    
    // Opcionales
    const trainOrigin = document.getElementById('b-train-origin')?.checked;
    const pet = document.getElementById('b-pet')?.checked;
    const luggage = document.getElementById('chip-luggage')?.value || '0';
    const luggageInt = parseInt(luggage) || 0;
    const passengers = document.getElementById('chip-passengers')?.value || '1';
    const passengersInt = parseInt(passengers) || 1;
    const isAdapted = document.getElementById('check-disability')?.checked || false;
    
    // Extra plazas calculation (max 4 per standard taxi, anything above is extra plaza)
    let extraPlazaInt = Math.max(0, passengersInt - 4);
    if (isAdapted) { extraPlazaInt = 0; } // Exento si viaja persona con discapacidad

    // Opciones extra
    let extras = [];
    if (trainOrigin) extras.push("Origen Estación de Tren Plaza Sevilla");
    if (pet) extras.push("Mascota (en transportín)");
    if (luggageInt > 0) extras.push(`${luggageInt} Maleta(s) grande(s)`);
    if (passengersInt > 4) extras.push(`Vehículo grande (${passengersInt} plazas)`);
    if (isAdapted) extras.push("Taxi adaptado (PMR)");

    // --- CÁLCULO DE PRECIO ESTIMADO ---
    let estimatedPriceText = "";
    if (calcContext.bookingOrigin && calcContext.bookingDest) {
        try {
            const targetDate = new Date(`${date}T${time}:00`);
            const routeInfo = await getRouteDetails(calcContext.bookingOrigin, calcContext.bookingDest);
            const tarifaMode = determineTariffMode(targetDate, routeInfo.isInter);
            
            // calculatePrice params: routeInfo, tarifaMode, hasRenfe, hasPuerto, hasCortadura, isAdapted, luggageCount, extraPlazaCount
            const result = calculatePrice(routeInfo, tarifaMode, trainOrigin, false, false, isAdapted, luggageInt, extraPlazaInt);
            const formattedPrice = result.precioTaximetro.toFixed(2).replace('.', ',');
            estimatedPriceText = `(Estimación aproximada según calculador web: ~${formattedPrice}€)`;
        } catch(e) {
            console.error("Error calculando estimación para el correo:", e);
        }
    }

    // --- COMPONER EL EMAIL ---
    const targetEmail = "reservas@radiotaxicadiz.com";
    
    // Aleatorizar el asunto para no ser "spammy"
    const subjects = [
        `🚕 Reserva de taxi: ${date} a las ${time} (A nombre de ${name})`,
        `Solicitud de Taxi para el ${date} - ${time}`,
        `🚕 Nuevo viaje programado: ${date} a las ${time}`
    ];
    const rawSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const subject = encodeURIComponent(rawSubject);
    
    // Aleatorizar el saludo
    const greetings = [
        "Hola, equipo de Radio Taxi.\n\nMe gustaría dejar reservado un taxi con ustedes. Aquí tienen todos los detalles de mi viaje para que puedan registrarlo en su sistema:\n\n",
        "Buenos días/tardes.\n\nLes escribo para solicitar un servicio de taxi programado. Les facilito los datos completos del trayecto:\n\n",
        "Saludos.\n\nNecesito dejar agendado un viaje con antelación. A continuación detallo la información del pasajero y la ruta:\n\n"
    ];
    const rawGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    let bodyText = rawGreeting;
    bodyText += `DATOS DEL PASAJERO:\n`;
    bodyText += `- Nombre: ${name}\n`;
    bodyText += `- Teléfono: ${phone}\n\n`;
    bodyText += `DATOS DEL VIAJE:\n`;
    bodyText += `- Fecha: ${date}\n`;
    bodyText += `- Hora: ${time}\n`;
    bodyText += `- Recogida en: ${pickup}\n`;
    bodyText += `- Destino: ${dropoff}\n\n`;
    
    if (estimatedPriceText) {
        bodyText += `${estimatedPriceText}\n\n`;
    }
    
    if (extras.length > 0) {
        bodyText += `EXTRAS SOLICITADOS:\n`;
        extras.forEach(e => bodyText += `- ${e}\n`);
        bodyText += `\n`;
    }
    
    // Aleatorizar despedida
    const closures = [
        "Por favor, confírmenme respondiendo a este correo que la reserva queda anotada.\nMuchas gracias por su ayuda.",
        "Quedo a la espera de su confirmación para saber que el viaje está registrado.\nUn saludo y gracias.",
        "Agradecería que me contesten a este email para confirmar que el taxi está reservado.\nGracias de antemano."
    ];
    const rawClosure = closures[Math.floor(Math.random() * closures.length)];
    bodyText += rawClosure + "\n\n---\n🚕 Reserva enviada a través de cadiz.taxi";
    
    const body = encodeURIComponent(bodyText);
    
    // Disparar Mailto
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    
    // Feedback local al usuario
    const summaryCard = document.getElementById('b-summary-card');
    if (summaryCard) {
        summaryCard.style.display = 'block';
        summaryCard.innerHTML = `
            <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 12px; padding: 1.5rem; text-align: center; margin-top: 1rem;">
                <i data-lucide="mail-check" style="width: 48px; height: 48px; color: #00ff88; margin-bottom: 1rem;"></i>
                <h3 style="color: #00ff88; margin-top: 0; font-size: 1.2rem;">¡Borrador Generado con Éxito!</h3>
                <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">Hemos abierto tu aplicación de correo predeterminada (Gmail, Apple Mail, etc.) con los datos listos para enviar a la central oficial de taxis. <br><br><strong style="color:#fff;">⚠️ IMPORTANTE: No olvides pulsar "Enviar" en tu aplicación de correo.</strong></p>
            </div>
        `;
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    return false;
}