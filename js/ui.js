import { translations, state, routeState, routeData, calcState, calcContext } from './config.js';
import { updatePriceUI, updateCalcPriceUI, calculateRoute } from './pricing.js';

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
    if (newL > 10) newL = 10;
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
                            onSelect({
                                name: name,
                                city: city || 'Cádiz',
                                lat: feature.geometry.coordinates[1],
                                lon: feature.geometry.coordinates[0]
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

export function geolocateOrigin() {
    const input = document.getElementById('calc-origin');
    if (input && input.value.trim() !== '') return;

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
        calcState.originLat = lat;
        calcState.originLon = lon;
        try {
            const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                const props = data.features[0].properties;
                const street = props.street || props.name || "Ubicación actual";
                if (input && input.value.trim() === '') {
                    input.value = street;
                }
                calcContext.selectedOrigin = {
                    name: street,
                    city: props.city || 'Cádiz',
                    lat: lat,
                    lon: lon
                };
            } else {
                if (input && input.value.trim() === '') {
                    input.value = lat.toFixed(4) + ", " + lon.toFixed(4);
                }
                calcContext.selectedOrigin = {
                    name: "Ubicación detectada",
                    city: 'Cádiz',
                    lat: lat,
                    lon: lon
                };
            }
        } catch(e) {
            if (input && input.value.trim() === '') {
                input.value = "Ubicación detectada";
            }
            calcContext.selectedOrigin = {
                name: "Ubicación detectada",
                city: 'Cádiz',
                lat: lat,
                lon: lon
            };
        }
        if (input) input.placeholder = "Origen (ej. Av. Andalucía)";
    }, () => {
        // Fallo silencioso si deniega el GPS
        if (input) input.placeholder = "Origen (ej. Av. Andalucía)";
    });
}

export function confirmReservation(event) {
    event.preventDefault();
    const name = document.getElementById('b-name').value;
    const date = document.getElementById('b-date').value;
    const time = document.getElementById('b-time').value;
    const phone = document.getElementById('b-phone').value;
    const pickup = document.getElementById('b-pickup').value;
    const dropoff = document.getElementById('b-dropoff').value;
    
    // Extraer campos opcionales de los selects ocultos
    const chipPassengers = document.getElementById('chip-passengers');
    const chipLuggage = document.getElementById('chip-luggage');
    const chipPet = document.getElementById('chip-pet');
    const chipPayment = document.getElementById('chip-payment');
    
    const passengers = chipPassengers ? chipPassengers.value : "1";
    const luggage = chipLuggage ? chipLuggage.value : "0";
    const pet = chipPet ? chipPet.value : "No";
    const payment = chipPayment ? chipPayment.value : "Indiferente";
    
    const trainContainer = document.getElementById('b-train-container');
    const trainInput = document.getElementById('b-train');
    let trainNumberText = "";
    if (trainContainer && !trainContainer.classList.contains('hidden') && trainInput && trainInput.value.trim() !== '') {
        trainNumberText = `\n🚆 Nº de Tren: ${trainInput.value.trim()}`;
    }
    
    if (date) {
        const selectedDate = new Date(date);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 1); // Empezar mañana (para que las 48h abarquen pasado mañana)
        minDate.setHours(23, 59, 59, 999);
        
        if (selectedDate <= minDate) {
            const alertMsg = state.currentLanguage === 'es'
                ? "Las reservas online solo pueden realizarse con un mínimo de 48h de antelación. Para reservas urgentes, por favor llame por teléfono."
                : "Online bookings can only be made with a minimum of 48h notice. For urgent bookings, please call us.";
            alert(alertMsg);
            return false;
        }
    }
    
    const confirmMsg = state.currentLanguage === 'es' 
        ? "Aviso importante: Tienes que esperar a que te confirmemos la reserva. ¿Estás de acuerdo?" 
        : "Important notice: You must wait for us to confirm your booking. Do you agree?";
    
    if (!window.confirm(confirmMsg)) {
        return false;
    }
    
    const email = "contacto@radiotaxicadiz.es";
    const subject = state.currentLanguage === 'es' 
        ? `Solicitud de reserva de Taxi - ${name} - ${date}`
        : `Taxi booking request - ${name} - ${date}`;
    
    const body = state.currentLanguage === 'es'
        ? `¡Hola equipo de Radio Taxi Cádiz!\n\nSoy ${name} y necesito reservar un taxi con los siguientes detalles:\n\n📱 Teléfono: ${phone}\n📍 Recogida: ${pickup}\n🏁 Destino: ${dropoff}\n📅 Día: ${date}\n🕒 Hora: ${time}${trainNumberText}\n\n👥 Pasajeros: ${passengers}\n🧳 Maletas: ${luggage}\n🐕 Mascota: ${pet}\n💳 Pago: ${payment}\n\nQuedo a la espera de vuestra confirmación. ¡Muchas gracias y un saludo!\n\nAtentamente,\n${name}`
        : `Hello Radio Taxi Cádiz team!\n\nMy name is ${name} and I would like to book a taxi with the following details:\n\n📱 Phone: ${phone}\n📍 Pickup: ${pickup}\n🏁 Destination: ${dropoff}\n📅 Date: ${date}\n🕒 Time: ${time}${trainNumberText}\n\n👥 Passengers: ${passengers}\n🧳 Luggage: ${luggage}\n🐕 Pet: ${pet === 'Sí' ? 'Yes' : 'No'}\n💳 Payment: ${payment === 'Efectivo o Tarjeta' ? 'Any' : (payment === 'Tarjeta' ? 'Card' : 'Cash')}\n\nI look forward to your confirmation. Thank you very much!\n\nBest regards,\n${name}`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return false;
}


