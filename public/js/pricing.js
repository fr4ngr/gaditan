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

export function calculatePrice(routeInfo, tarifaMode, hasRenfe, hasPuerto, hasCortadura, isAdapted, luggageCount, extraPlazaCount = 0) {
    // tarifaMode is 1, 2, 3 (Urbano) or 7, 8 (Interurbano)
    let basePriceCerrado = 0;
    let basePriceTaximetro = 0;
    
    let estimatedWaitMins = 0;
    let waitCost = 0;

    if (routeInfo.isInter) {
        // REGLA 1 y 3 (Interurbano)
        const iRate = (tarifaMode === 8) ? interurbanRates.night : interurbanRates.day;
        
        let flagDrop = 0;
        if (routeInfo.finalDistanceKm < 12) {
            flagDrop = iRate.flag;
        }

        const interurbanWaitMins = routeInfo.osrmDurationMin * 0.10; 
        estimatedWaitMins = interurbanWaitMins;
        waitCost = (estimatedWaitMins / 60) * iRate.waitHour;

        basePriceCerrado = flagDrop + (routeInfo.finalDistanceKm * iRate.km);
        if (basePriceCerrado < iRate.min) basePriceCerrado = iRate.min;
        
        basePriceTaximetro = basePriceCerrado + waitCost;

    } else {
        // REGLA 1 y 3 (Urbano)
        const uRate = (tarifaMode === 1) ? urbanRates.day : urbanRates.night;
        
        const avgSpeedKmh = (tarifaMode !== 1) ? 25 : 15;
        const realDurationMin = (routeInfo.finalDistanceKm / avgSpeedKmh) * 60;
        
        estimatedWaitMins = Math.max(0, realDurationMin - routeInfo.osrmDurationMin);
        waitCost = (estimatedWaitMins / 60) * uRate.waitHour;

        basePriceCerrado = uRate.flag + (routeInfo.finalDistanceKm * uRate.km);
        
        if (tarifaMode === 3) {
            basePriceCerrado = basePriceCerrado * 1.20; // Incremento del 20%
        }

        const minFare = (tarifaMode === 1) ? urbanRates.day.min : urbanRates.night.min;
        const finalMinFare = (tarifaMode === 3) ? (minFare * 1.20) : minFare;
        
        if (basePriceCerrado < finalMinFare) basePriceCerrado = finalMinFare; // Carrera Mínima
        
        basePriceTaximetro = basePriceCerrado + waitCost;
        
        // REGLA 4: Suplementos (Solo Urbano) - aplican a ambos
        let supps = 0;
        if (hasRenfe) supps += supplements.renfe;
        if (hasPuerto) supps += supplements.puerto;
        if (hasCortadura) supps += supplements.cortadura;
        if (luggageCount > 0) supps += luggageCount * supplements.luggage;
        if (extraPlazaCount > 0 && !isAdapted) supps += extraPlazaCount * supplements.extra_plaza;
        
        basePriceCerrado += supps;
        basePriceTaximetro += supps;
    }

    return {
        precioCerrado: basePriceCerrado,
        precioTaximetro: basePriceTaximetro,
        finalDurationMin: Math.ceil(routeInfo.osrmDurationMin + estimatedWaitMins),
        estimatedWaitMins: Math.ceil(estimatedWaitMins)
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
    
    const result = calculatePrice(calcContext.lastCalcRoute, tarifaMode, renfeChecked, puertoChecked, cortaduraChecked, false, calcState.luggage, calcState.extraPlaza);
    
    const formattedCerrado = result.precioCerrado.toFixed(2).replace('.', ',');
    const formattedTaximetro = result.precioTaximetro.toFixed(2).replace('.', ',');
    const formattedDist = calcContext.lastCalcRoute.finalDistanceKm.toFixed(1).replace('.', ',');
    
    document.getElementById('calc-dist-val').innerText = formattedDist + ' km';
    document.getElementById('calc-time-val').innerText = result.finalDurationMin + ' min';
    
    const cerradoEl = document.getElementById('calc-price-cerrado');
    const taximetroEl = document.getElementById('calc-price-taximetro');
    
    if(cerradoEl) cerradoEl.innerText = formattedCerrado + '€';
    if(taximetroEl) taximetroEl.innerText = '~ ' + formattedTaximetro + '€';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pricingCalc.init());
} else {
    pricingCalc.init();
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
            calcContext.calcMapInstance = new maplibregl.Map({
                container: 'calc-map',
                style: {
                    "version": 8,
                    "sources": {
                        "osm": {
                            "type": "raster",
                            "tiles": ["https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"],
                            "tileSize": 256,
                            "attribution": "© OpenStreetMap © CartoDB"
                        }
                    },
                    "layers": [
                        {
                            "id": "osm-layer",
                            "type": "raster",
                            "source": "osm",
                            "layout": { "visibility": "visible" }
                        }
                    ]
                },
                center: [-6.29, 36.52],
                zoom: 13,
                attributionControl: false
            });
            calcContext.calcMapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
            calcContext.calcMapMarkers = [];
        } else {
            // Limpiar marcadores
            if (calcContext.calcMapMarkers) {
                calcContext.calcMapMarkers.forEach(m => m.remove());
            }
            calcContext.calcMapMarkers = [];
            // Limpiar ruta
            if (calcContext.calcMapInstance.getLayer('calc-route-line')) {
                calcContext.calcMapInstance.removeLayer('calc-route-line');
                calcContext.calcMapInstance.removeSource('calc-route-line');
            }
        }
        
        const originMarker = new maplibregl.Marker()
            .setLngLat([exactOrigin.lon, exactOrigin.lat])
            .setPopup(new maplibregl.Popup().setText("Origen"))
            .addTo(calcContext.calcMapInstance);
            
        const destMarker = new maplibregl.Marker()
            .setLngLat([exactDest.lon, exactDest.lat])
            .setPopup(new maplibregl.Popup().setText("Destino"))
            .addTo(calcContext.calcMapInstance);
            
        calcContext.calcMapMarkers.push(originMarker, destMarker);
        
        if (routeDetails.geometry) {
            // MapLibre espera GeoJSON
            calcContext.calcMapInstance.addSource('calc-route-line', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: routeDetails.geometry
                }
            });
            
            calcContext.calcMapInstance.addLayer({
                id: 'calc-route-line',
                type: 'line',
                source: 'calc-route-line',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#06b6d4',
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });
        }
        
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([exactOrigin.lon, exactOrigin.lat]);
        bounds.extend([exactDest.lon, exactDest.lat]);
        if (routeDetails.geometry && routeDetails.geometry.coordinates) {
            routeDetails.geometry.coordinates.forEach(coord => bounds.extend(coord));
        }
        
        setTimeout(() => {
            calcContext.calcMapInstance.resize();
            calcContext.calcMapInstance.fitBounds(bounds, { padding: 20 });
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
