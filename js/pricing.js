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
    document.getElementById('price-'+id).innerText = formattedTotal + '\u20AC';
}

export function updateCalcPriceUI() {
    if (!calcContext.lastCalcRoute) return;
    const r = calcContext.lastCalcRoute;
    const isNight = !calcState.isDay || calcState.isFestivo;
    
    const uFlag = isNight ? urbanRates.night.flag : urbanRates.day.flag;
    const uKm = isNight ? urbanRates.night.km : urbanRates.day.km;
    const uWait = isNight ? urbanRates.night.waitHour : urbanRates.day.waitHour;
    
    const iKm = isNight ? interurbanRates.night.km : interurbanRates.day.km;
    const iWait = isNight ? interurbanRates.night.waitHour : interurbanRates.day.waitHour;

    let basePrice = 0;
    let estimatedWaitMins = 0;
    let waitCost = 0;

    if (r.isInter) {
        const avgUrbanSpeed = isNight ? 25 : 15;
        const realUrbanDurationMin = (r.urbanKm / avgUrbanSpeed) * 60;
        const osrmUrbanEstimate = (r.urbanKm / 40) * 60; 
        const urbanWaitMins = Math.max(0, realUrbanDurationMin - osrmUrbanEstimate);
        
        const interurbanWaitMins = r.osrmDurationMin * 0.05;
        
        estimatedWaitMins = urbanWaitMins + interurbanWaitMins;
        waitCost = (estimatedWaitMins / 60) * iWait;

        basePrice = uFlag + (r.urbanKm * uKm) + (r.interurbanKm * iKm) + waitCost;
        const minFare = isNight ? interurbanRates.night.min : interurbanRates.day.min;
        if (basePrice < minFare) basePrice = minFare;
    } else {
        const avgSpeedKmh = isNight ? 25 : 15;
        const realDurationMin = (r.urbanKm / avgSpeedKmh) * 60;
        
        estimatedWaitMins = Math.max(0, realDurationMin - r.osrmDurationMin);
        waitCost = (estimatedWaitMins / 60) * uWait;

        basePrice = uFlag + (r.urbanKm * uKm) + waitCost;
        const minFare = isNight ? urbanRates.night.min : urbanRates.day.min;
        if (basePrice < minFare) basePrice = minFare;
    }

    const finalDurationMin = Math.ceil(r.osrmDurationMin + estimatedWaitMins);

    if (calcState.hasRenfe) {
        basePrice += r.isInter ? supplements.renfe : 1.30; 
    }
    if (calcState.luggage > 0) {
        basePrice += calcState.luggage * supplements.luggage;
    }
    
    const formattedPrice = basePrice.toFixed(2).replace('.', ',');
    const formattedDist = r.finalDistanceKm.toFixed(1).replace('.', ',');
    
    document.getElementById('calc-dist-val').innerText = formattedDist + ' km';
    document.getElementById('calc-time-val').innerText = finalDurationMin + ' min';
    document.getElementById('calc-price-val').innerText = '~\u20AC' + formattedPrice;
}

export function isInterurban(destData) {
    if (!destData || !destData.city) return false;
    const city = destData.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return city !== "cadiz";
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

        let finalDistanceKm = 0;
        let finalDurationMin = 0;
        let urbanKm = 0;
        let interurbanKm = 0;
        let finalGeometry = null;

        const isInter = isInterurban(exactDest);

        if (isInter) {
            let bestRoute = null;
            let minTotalTime = Infinity;

            for (let exit of EXITS) {
                const routeToExit = await getOSRMRoute(exactOrigin, exit);
                const routeToDest = await getOSRMRoute(exit, exactDest);
                
                const totalTime = routeToExit.durationMin + routeToDest.durationMin;
                if (totalTime < minTotalTime) {
                    minTotalTime = totalTime;
                    bestRoute = {
                        urbanDistance: routeToExit.distanceKm,
                        interurbanDistance: routeToDest.distanceKm,
                        totalDuration: totalTime,
                        geometry: {
                            type: "LineString",
                            coordinates: [...routeToExit.geometry.coordinates, ...routeToDest.geometry.coordinates]
                        }
                    };
                }
            }
            
            urbanKm = bestRoute.urbanDistance;
            interurbanKm = bestRoute.interurbanDistance;
            finalDistanceKm = urbanKm + interurbanKm;
            finalDurationMin = bestRoute.totalDuration;
            finalGeometry = bestRoute.geometry;
        } else {
            const route = await getOSRMRoute(exactOrigin, exactDest);
            urbanKm = route.distanceKm;
            finalDistanceKm = urbanKm;
            finalDurationMin = route.durationMin;
            finalGeometry = route.geometry;
        }
        
        calcContext.lastCalcRoute = {
            isInter: isInter,
            urbanKm: urbanKm,
            interurbanKm: typeof interurbanKm !== 'undefined' ? interurbanKm : 0,
            finalDistanceKm: finalDistanceKm,
            osrmDurationMin: finalDurationMin
        };
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
        
        if (finalGeometry) {
            const routeLine = L.geoJSON(finalGeometry, {
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
