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

export function isInterurban(destData) {
    if (!destData || !destData.city) return false;
    const city = destData.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return city !== "cadiz";
}

export async function getRouteDetails(exactOrigin, exactDest) {
    const isInter = isInterurban(exactDest);
    let finalDistanceKm = 0;
    let finalDurationMin = 0;
    let finalGeometry = null;

    // Ya no separamos urbano de interurbano, simplemente sacamos la ruta total
    const route = await getOSRMRoute(exactOrigin, exactDest);
    finalDistanceKm = route.distanceKm;
    finalDurationMin = route.durationMin;
    finalGeometry = route.geometry;

    return {
        isInter,
        finalDistanceKm,
        osrmDurationMin: finalDurationMin,
        geometry: finalGeometry,
        originCoords: exactOrigin,
        destCoords: exactDest
    };
}

export function calculatePrice(routeInfo, isNight, isFestivo, hasRenfe, hasPuerto, hasCortadura, isAdapted, luggageCount) {
    const isNightOrFestivo = isNight || isFestivo;
    const uFlag = isNightOrFestivo ? urbanRates.night.flag : urbanRates.day.flag;
    const uKm = isNightOrFestivo ? urbanRates.night.km : urbanRates.day.km;
    const uWait = isNightOrFestivo ? urbanRates.night.waitHour : urbanRates.day.waitHour;
    
    const iKm = isNightOrFestivo ? interurbanRates.night.km : interurbanRates.day.km;
    const iWait = isNightOrFestivo ? interurbanRates.night.waitHour : interurbanRates.day.waitHour;
    // La tarifa interurbana también puede tener un mínimo de percepción
    const iMin = isNightOrFestivo ? interurbanRates.night.min : interurbanRates.day.min;

    let basePrice = 0;
    let estimatedWaitMins = 0;
    let waitCost = 0;

    if (routeInfo.isInter) {
        // Regla 1: 100% de los km se calculan con Tarifas Interurbanas
        // Generalmente las tarifas interurbanas no cobran bajada de bandera en carretera, pero si la hay se suma.
        // Simularemos un recargo mínimo inicial (si aplica) o directamente el km
        
        // Wait time in interurban
        const interurbanWaitMins = routeInfo.osrmDurationMin * 0.10; // 10% del tiempo estimado como espera por semáforos/tráfico
        estimatedWaitMins = interurbanWaitMins;
        waitCost = (estimatedWaitMins / 60) * iWait;

        basePrice = (routeInfo.finalDistanceKm * iKm) + waitCost;
        if (basePrice < iMin) basePrice = iMin; // Mínimo de percepción interurbano (ej: 3.83€)
    } else {
        // Urbano
        const avgSpeedKmh = isNightOrFestivo ? 25 : 15;
        const realDurationMin = (routeInfo.finalDistanceKm / avgSpeedKmh) * 60;
        
        estimatedWaitMins = Math.max(0, realDurationMin - routeInfo.osrmDurationMin);
        waitCost = (estimatedWaitMins / 60) * uWait;

        basePrice = uFlag + (routeInfo.finalDistanceKm * uKm) + waitCost;
        const minFare = isNightOrFestivo ? urbanRates.night.min : urbanRates.day.min;
        if (basePrice < minFare) basePrice = minFare;
    }

    // Suplementos (solo en urbano o desde puntos clave)
    // El suplemento de >4 plazas lo aplicamos si no tiene discapacidad. Pero como no preguntamos plazas > 4 (viajeros son 1-4 en el stepper, max 8),
    // Si usuarios piden "Vehículo Adaptado" no pagan plus. Asumiremos el suplemento de maletas y renfe/puerto/cortadura.
    if (hasRenfe && !routeInfo.isInter) {
        basePrice += 1.30; 
    } else if (hasRenfe && routeInfo.isInter) {
        basePrice += 0.82; 
    }
    
    // Suplementos Puerto y Cortadura (valores aproximados si no están en config, 1.30 urbano)
    if (hasPuerto && !routeInfo.isInter) basePrice += 1.30;
    if (hasCortadura && !routeInfo.isInter) basePrice += 1.30;

    if (luggageCount > 0) {
        basePrice += luggageCount * supplements.luggage;
    }

    return {
        price: basePrice,
        finalDurationMin: Math.ceil(routeInfo.osrmDurationMin + estimatedWaitMins)
    };
}

export function updateCalcPriceUI() {
    if (!calcContext.lastCalcRoute) return;
    const isNight = !calcState.isDay;
    const result = calculatePrice(calcContext.lastCalcRoute, isNight, calcState.isFestivo, calcState.hasRenfe, calcState.luggage);
    
    const formattedPrice = result.price.toFixed(2).replace('.', ',');
    const formattedDist = calcContext.lastCalcRoute.finalDistanceKm.toFixed(1).replace('.', ',');
    
    document.getElementById('calc-dist-val').innerText = formattedDist + ' km';
    document.getElementById('calc-time-val').innerText = result.finalDurationMin + ' min';
    document.getElementById('calc-price-val').innerText = '~€' + formattedPrice;
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
        const oNum = document.getElementById('calc-origin-num') ? document.getElementById('calc-origin-num').value : '';
        const dNum = document.getElementById('calc-dest-num') ? document.getElementById('calc-dest-num').value : '';
        
        const exactOrigin = await getExactCoordinate(calcContext.selectedOrigin, oNum);
        const exactDest = await getExactCoordinate(calcContext.selectedDest, dNum);

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
