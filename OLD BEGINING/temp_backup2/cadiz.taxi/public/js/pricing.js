import { routeState, routeData, urbanRates, interurbanRates, supplements, calcState, calcContext, EXITS, state } from './config.js';
import { getOSRMRoute, getExactCoordinate } from './api.js';

export function updatePriceUI(id) {
    if(!document.getElementById('price-'+id)) return;
    const st = routeState[id];
    const data = routeData[id];
    
    const isNightOrFestivo = (!st.isDay || st.isFestivo);
    
    const activeUrbanRate = isNightOrFestivo ? urbanRates.night : urbanRates.day;
    const activeInterRate = isNightOrFestivo ? interurbanRates.night : interurbanRates.day;
    
    let costeUrbano = activeUrbanRate.flag + 
                      (data.distUrban * activeUrbanRate.km) + 
                      ((data.waitMins / 60) * activeUrbanRate.waitHour);
                      
    let costeInterurbano = 0;
    if (data.type === 'interurban') {
        costeInterurbano = (data.distInter * activeInterRate.km);
        const totalCarrera = costeUrbano + costeInterurbano;
        if (totalCarrera < activeInterRate.min) {
            costeUrbano = activeInterRate.min;
            costeInterurbano = 0;
        }
    } else {
        if (costeUrbano < activeUrbanRate.min) {
            costeUrbano = activeUrbanRate.min;
        }
    }
    
    let costeSuplementos = (st.luggage * supplements.luggage) + (st.renfe ? supplements.renfe : 0);
    
    let total = costeUrbano + costeInterurbano + costeSuplementos;
    
    let formattedTotal = Math.round(total).toString();
    document.getElementById('price-'+id).innerText = formattedTotal + '€';
}

export function isInterurban(originData, destData) {
    if (!destData || !destData.city) return false;
    const originCity = (originData && originData.city) ? originData.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "cadiz";
    const destCity = destData.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Regla 1: Es interurbano si sale o no de Cadiz capital. 
    // Si origen es Jerez y destino es Cadiz, es interurbano.
    // Si origen es Cadiz y destino es Jerez, es interurbano.
    return (originCity !== "cadiz" || destCity !== "cadiz");
}

export async function getRouteDetails(exactOrigin, exactDest) {
    const isInter = isInterurban(exactOrigin, exactDest);
    
    const route = await getOSRMRoute(exactOrigin, exactDest);
    
    return {
        isInter,
        finalDistanceKm: route.distanceKm,
        osrmDurationMin: route.durationMin,
        geometry: route.geometry,
        originCoords: exactOrigin,
        destCoords: exactDest
    };
}

export function calculatePrice(routeInfo, tarifaMode, hasRenfe, hasPuerto, hasCortadura, isAdapted, luggageCount) {
    // tarifaMode is 1, 2, 3 (Urbano) or 7, 8 (Interurbano)
    let basePrice = 0;
    let estimatedWaitMins = 0;
    let waitCost = 0;

    if (routeInfo.isInter) {
        // REGLA 1 y 3 (Interurbano)
        const iRate = (tarifaMode === 8) ? interurbanRates.night : interurbanRates.day;
        
        // Condición 12 Kilómetros
        let flagDrop = 0;
        if (routeInfo.finalDistanceKm < 12) {
            flagDrop = iRate.flag;
        }

        const interurbanWaitMins = routeInfo.osrmDurationMin * 0.10; 
        estimatedWaitMins = interurbanWaitMins;
        waitCost = (estimatedWaitMins / 60) * iRate.waitHour;

        basePrice = flagDrop + (routeInfo.finalDistanceKm * iRate.km) + waitCost;
        if (basePrice < iRate.min) basePrice = iRate.min; // Mínimo de percepción (suelo absoluto)
    } else {
        // REGLA 1 y 3 (Urbano)
        const uRate = (tarifaMode === 1) ? urbanRates.day : urbanRates.night;
        
        const avgSpeedKmh = (tarifaMode !== 1) ? 25 : 15;
        const realDurationMin = (routeInfo.finalDistanceKm / avgSpeedKmh) * 60;
        
        estimatedWaitMins = Math.max(0, realDurationMin - routeInfo.osrmDurationMin);
        waitCost = (estimatedWaitMins / 60) * uRate.waitHour;

        basePrice = uRate.flag + (routeInfo.finalDistanceKm * uRate.km) + waitCost;
        
        if (tarifaMode === 3) {
            basePrice = basePrice * 1.20; // Incremento del 20%
        }

        const minFare = (tarifaMode === 1) ? urbanRates.day.min : urbanRates.night.min;
        const finalMinFare = (tarifaMode === 3) ? (minFare * 1.20) : minFare;
        
        if (basePrice < finalMinFare) basePrice = finalMinFare; // Carrera Mínima
        
        // REGLA 4: Suplementos (Solo Urbano)
        if (hasRenfe) basePrice += supplements.renfe;
        if (hasPuerto) basePrice += supplements.puerto;
        if (hasCortadura) basePrice += supplements.cortadura;
        if (luggageCount > 0) basePrice += luggageCount * supplements.luggage;
    }

    return {
        price: basePrice,
        finalDurationMin: Math.ceil(routeInfo.osrmDurationMin + estimatedWaitMins)
    };
}

export function determineTariffMode(targetDate, isInter) {
    const h = targetDate.getHours();
    const day = targetDate.getDay(); // 0 is Sunday
    const month = targetDate.getMonth();
    const date = targetDate.getDate();

    // Check for Navidad (Nochebuena 24 Dec and Nochevieja 31 Dec from 21:00 to 23:59)
    let isNavidad = false;
    if (month === 11 && (date === 24 || date === 31) && h >= 21) isNavidad = true;

    // Check for Tarifa 3 (Especial Urbana)
    let isTarifa3 = false;
    if (!isInter) {
        if (day === 6 && h >= 3 && h < 6) isTarifa3 = true;
        if ((day === 0 || /*festivo*/ false) && h >= 3 && h < 7) isTarifa3 = true;
        if (isNavidad) isTarifa3 = true;
        // Carnaval and Semana Santa logic can be added here if we check specific dates.
    }

    if (isInter) {
        // T7: L-V de 06 a 22h. T8: resto.
        if (day >= 1 && day <= 5 && h >= 6 && h < 22) {
            return 7;
        } else {
            return 8;
        }
    } else {
        if (isTarifa3) return 3;
        // T1: L-V de 07 a 21h. T2: resto.
        if (day >= 1 && day <= 5 && h >= 7 && h < 21) {
            return 1;
        } else {
            return 2;
        }
    }
}

export function updateCalcPriceUI() {
    if (!calcContext.lastCalcRoute) return;
    
    const whenSelect = document.getElementById('calc-when');
    let targetDate = new Date();
    
    if (whenSelect && whenSelect.value === 'later') {
        const dateVal = document.getElementById('calc-date')?.value;
        const timeVal = document.getElementById('calc-time')?.value;
        if (dateVal && timeVal) {
            targetDate = new Date(`${dateVal}T${timeVal}`);
        }
    }
    
    // Check dynamic checkboxes that might have been checked directly
    const renfeChecked = document.getElementById('calc-renfe-toggle')?.checked || false;
    const puertoChecked = document.getElementById('calc-puerto-toggle')?.checked || false;
    const cortaduraChecked = document.getElementById('calc-cortadura-toggle')?.checked || false;
    
    const tarifaMode = determineTariffMode(targetDate, calcContext.lastCalcRoute.isInter);
    
    const result = calculatePrice(calcContext.lastCalcRoute, tarifaMode, renfeChecked, puertoChecked, cortaduraChecked, false, calcState.luggage);
    
    const formattedPrice = result.price.toFixed(2).replace('.', ',');
    const formattedDist = calcContext.lastCalcRoute.finalDistanceKm.toFixed(1).replace('.', ',');
    
    document.getElementById('calc-dist-val').innerText = formattedDist + ' km';
    document.getElementById('calc-time-val').innerText = result.finalDurationMin + ' min';
    document.getElementById('calc-price-val').innerText = 'Máx ' + formattedPrice + '€';
}

export async function calculateRoute() {
    const errorDiv = document.getElementById('calc-error');
    const resultDiv = document.getElementById('calc-result');
    const loadingDiv = document.getElementById('calc-loading');
    
    if (!calcContext.selectedOrigin || !calcContext.selectedDest) {
        errorDiv.style.display = 'block';
        document.getElementById('calc-error-text').innerText = (state.currentLanguage === 'es') ? 'Por favor, selecciona origen y destino de las sugerencias.' : 'Please select origin and destination from suggestions.';
        resultDiv.style.display = 'none';
        return;
    }
    
    errorDiv.style.display = 'none';
    resultDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
    
    try {
        const exactOrigin = await getExactCoordinate(calcContext.selectedOrigin, "");
        const exactDest = await getExactCoordinate(calcContext.selectedDest, "");

        const routeDetails = await getRouteDetails(exactOrigin, exactDest);
        calcContext.lastCalcRoute = routeDetails;
        
        updateCalcPriceUI();

        const mapDiv = document.getElementById('calc-map');
        mapDiv.style.display = 'block';
        
        if (!calcContext.calcMapInstance) {
            calcContext.calcMapInstance = L.map('calc-map').setView([36.52, -6.29], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(calcContext.calcMapInstance);
            calcContext.calcMapLayerGroup = L.featureGroup().addTo(calcContext.calcMapInstance);
        } else {
            calcContext.calcMapLayerGroup.clearLayers();
        }
        
        const originMarker = L.marker([exactOrigin.lat, exactOrigin.lon]).bindPopup("Origen");
        const destMarker = L.marker([exactDest.lat, exactDest.lon]).bindPopup("Destino");
        calcContext.calcMapLayerGroup.addLayer(originMarker);
        calcContext.calcMapLayerGroup.addLayer(destMarker);
        
        if (routeDetails.geometry) {
            const routeLine = L.geoJSON(routeDetails.geometry, {
                style: {
                    color: '#00d2ff',
                    weight: 4,
                    opacity: 0.8
                }
            });
            calcContext.calcMapLayerGroup.addLayer(routeLine);
        }
        
        setTimeout(() => {
            calcContext.calcMapInstance.invalidateSize();
            calcContext.calcMapInstance.fitBounds(calcContext.calcMapLayerGroup.getBounds(), { padding: [20, 20] });
        }, 100);

        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        
    } catch (e) {
        console.error(e);
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        document.getElementById('calc-error-text').innerText = (state.currentLanguage === 'es') ? 'Error al calcular la ruta. Inténtalo de nuevo.' : 'Error calculating route. Try again.';
    }
}
