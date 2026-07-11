import L from 'leaflet';
import { dbParadas } from './mapData';

export const initMapManager = (rootElement: HTMLElement) => {
    const mapElement = rootElement.querySelector('#map') as HTMLElement;
    if (!mapElement) {
        console.error('Map element not found inside the widget');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let isTestMode = urlParams.has('test_cadiz');
    let mockLocation: any = null;
    let userMarker: any = null;
    let cachedLocation: {lat: number, lon: number} | null = null;
    let activeRouteLine: L.Polyline | null = null;
    const allMarkers: { marker: any, parada: any }[] = [];

    // Initialize map
    const map = L.map(mapElement, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile,
    });

    // Fit bounds tightly around the city stops
    const allBounds = L.latLngBounds(dbParadas.map(p => [p.lat, p.lon]));
    map.fitBounds(allBounds, { paddingBottomRight: [0, 20], paddingTopLeft: [0, 140] });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomright' }).addTo(map);

    // Custom Test Mode Control
    const TestControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function() {
            const btn = L.DomUtil.create('button', 'test-mode-btn');
            btn.innerHTML = isTestMode ? 'GPS Simulado ON' : 'Simular GPS';
            btn.style.backgroundColor = isTestMode ? '#1d4ed8' : '#fff';
            btn.style.color = isTestMode ? '#fff' : '#333';
            btn.style.border = '2px solid rgba(0,0,0,0.2)';
            btn.style.borderRadius = '8px';
            btn.style.padding = '6px 12px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            btn.style.margin = '10px';
            btn.style.pointerEvents = 'auto';
            
            btn.onclick = (e) => {
                L.DomEvent.stopPropagation(e);
                isTestMode = !isTestMode;
                if (isTestMode) {
                    btn.style.backgroundColor = '#1d4ed8';
                    btn.style.color = '#fff';
                    btn.innerHTML = 'GPS Simulado ON';
                    alert('Modo simulación activado. Haz clic en cualquier parte del mapa para ubicar tu GPS.');
                } else {
                    btn.style.backgroundColor = '#fff';
                    btn.style.color = '#333';
                    btn.innerHTML = 'Simular GPS';
                    if (userMarker) {
                        map.removeLayer(userMarker);
                        userMarker = null;
                        mockLocation = null;
                        cachedLocation = null;
                    }
                }
            };
            return btn;
        }
    });
    map.addControl(new TestControl());

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    }).addTo(map);

    const taxiSignSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 28">
            <rect x="0" y="0" width="24" height="28" rx="3.5" fill="#1d4ed8" />
            <rect x="2" y="2" width="20" height="12" rx="1.5" fill="white" />
            <text x="12" y="8" font-family="'Arial Black', 'Helvetica Neue', Helvetica, sans-serif" font-size="6" font-weight="900" fill="black" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">TAXI</text>
        </svg>
    `;

    // GPS Helper
    const getUserLocation = (): Promise<{lat: number, lon: number}> => {
        return new Promise((resolve, reject) => {
            if (cachedLocation) {
                return resolve(cachedLocation);
            }
            if (isTestMode) {
                const lat = mockLocation ? mockLocation.lat : 36.535;
                const lon = mockLocation ? mockLocation.lng : -6.293;
                if (userMarker) {
                    userMarker.setLatLng([lat, lon]);
                } else {
                    userMarker = L.circleMarker([lat, lon], {
                        radius: 8, fillColor: "#1d4ed8", color: "#fff", weight: 3, opacity: 1, fillOpacity: 1
                    }).addTo(map);
                }
                cachedLocation = {lat, lon};
                setTimeout(() => resolve(cachedLocation!), 100);
                return;
            }
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        cachedLocation = {lat: position.coords.latitude, lon: position.coords.longitude};
                        if (userMarker) {
                            userMarker.setLatLng([cachedLocation.lat, cachedLocation.lon]);
                        } else {
                            userMarker = L.circleMarker([cachedLocation.lat, cachedLocation.lon], {
                                radius: 8, fillColor: "#1d4ed8", color: "#fff", weight: 3, opacity: 1, fillOpacity: 1
                            }).addTo(map);
                        }
                        resolve(cachedLocation);
                    },
                    (error) => {
                        console.error("GPS Error", error);
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                reject(new Error("Geolocation not supported"));
            }
        });
    };

    // OSRM Routing API
    const calculateWalkingRoute = async (userLat: number, userLon: number, stopLat: number, stopLon: number) => {
        try {
            const res = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${userLon},${userLat};${stopLon},${stopLat}?overview=full&geometries=geojson&continue_straight=false`);
            const data = await res.json();
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    distance: route.distance, // meters
                    duration: route.duration, // seconds
                    geometry: route.geometry // GeoJSON LineString
                };
            }
        } catch (e) {
            console.error("Route fetch error", e);
        }
        return null;
    };

    // Bottom Sheet Setup
    const bottomSheetCard = rootElement.querySelector('#bottom-sheet-card') as HTMLElement;
    const bottomSheetContent = bottomSheetCard?.querySelector('.bottom-sheet-content') as HTMLElement;
    
    const hideOverlay = () => {
        if (bottomSheetCard) {
            bottomSheetCard.classList.remove('expanded');
            bottomSheetCard.classList.add('minimized');
            setTimeout(() => { if (bottomSheetContent) bottomSheetContent.innerHTML = ''; }, 350);
        }

        if (activeRouteLine) {
            map.removeLayer(activeRouteLine);
            activeRouteLine = null;
        }

        allMarkers.forEach(m => m.marker.setOpacity(1));
    };

    map.on('click', (e: any) => {
        if (isTestMode) {
            mockLocation = e.latlng;
            cachedLocation = null; // Clear cache so new test location is picked up
            const nearestBtn = rootElement.querySelector('[data-filter="nearest"]') as HTMLElement;
            if (nearestBtn) nearestBtn.click();
        }
    });

    const showOverlay = async (parada: any) => {
        if (!bottomSheetCard || !bottomSheetContent) return;

        bottomSheetContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; width: 100%;">
                <div style="width: 32px; align-self: stretch; flex-shrink: 0; display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 32px; height: 38px; flex-shrink: 0; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${taxiSignSvg}
                    </div>
                    <div style="width: 4px; background: #cbd5e1; flex: 1; border-radius: 2px; margin-top: 1px;"></div>
                </div>
                <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: center;">
                    <span style="color: #64748b; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.15rem;">PARADA DE TAXI</span>
                    <strong style="color: #0f172a; font-size: 1.1rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${parada.name}</strong>
                    <span style="color: #475569; font-size: 0.8rem; margin-top: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${parada.address}</span>
                </div>
                <div id="route-info-container" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; min-width: 80px; text-align: right;">
                    <span style="color: #94a3b8; font-size: 0.75rem;">Calculando...</span>
                </div>
            </div>
            
            <div style="display: flex; width: 100%; border-top: 1px solid #f1f5f9; margin-top: 0.75rem; padding-top: 0.75rem; gap: 0.5rem; justify-content: space-between;">
                <a class="sheet-action-btn" href="https://www.google.com/maps/dir/?api=1&destination=${parada.lat},${parada.lon}" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="7.5 5 9 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 16v-4a2 2 0 0 1 2-2h4M12 7l3 3-3 3"/></svg>
                    Ir
                </a>
                <button class="sheet-action-btn" onclick="document.getElementById('open-search-btn')?.click()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                    Calcular
                </button>
                <a class="sheet-action-btn primary" href="tel:+34956212121">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Llamar
                </a>
            </div>
        `;
        
        bottomSheetCard.classList.remove('minimized');
        bottomSheetCard.classList.add('expanded');
        
        allMarkers.forEach(m => {
            m.marker.setOpacity(m.parada.name !== parada.name ? 0 : 1);
        });

        const offset = map.project([parada.lat, parada.lon]).subtract([0, 50]);
        const newCenter = map.unproject(offset);
        map.setView(newCenter, 16);

        // Fetch Route
        try {
            const loc = await getUserLocation();
            
            // Fit bounds to show both user and stop
            const bounds = L.latLngBounds([[loc.lat, loc.lon], [parada.lat, parada.lon]]);
            map.fitBounds(bounds, {
                paddingTopLeft: [50, 150],
                paddingBottomRight: [50, 150],
                animate: true,
                duration: 1
            });

            const route = await calculateWalkingRoute(loc.lat, loc.lon, parada.lat, parada.lon);
            const routeContainer = bottomSheetCard.querySelector('#route-info-container');
            
            // Clear previous active route
            if (activeRouteLine) {
                map.removeLayer(activeRouteLine);
                activeRouteLine = null;
            }

            if (routeContainer && route) {
                const distText = route.distance > 1000 ? (route.distance / 1000).toFixed(1) + ' km' : Math.round(route.distance) + ' m';
                const mins = Math.max(1, Math.round(route.duration / 60));
                
                // Draw the animated route line
                if (route.geometry && route.geometry.coordinates) {
                    const latLngs = route.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);
                    activeRouteLine = L.polyline(latLngs, {
                        color: '#1d4ed8',
                        weight: 5,
                        opacity: 0.85,
                        dashArray: '10, 10',
                        className: 'animated-taxi-route'
                    }).addTo(map);
                }

                routeContainer.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
                        <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right;">
                            <span style="color: #0f172a; font-weight: 800; font-size: 1.1rem; line-height: 1;">
                                ${mins} <span style="font-size:0.8rem; font-weight: 700; color:#64748b;">min</span>
                            </span>
                            <span style="color: #64748b; font-size: 0.8rem; margin-top: 0.15rem; font-weight: 600; line-height: 1;">
                                ${distText}
                            </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 320 512" width="24" fill="currentColor" style="color: #1d4ed8; flex-shrink: 0;"><path d="M160 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM126.5 199.3c-1 .4-1.9 .8-2.9 1.2l-8 3.5c-16.4 7.3-29 21.2-34.7 38.2l-2.6 7.8c-5.6 16.8-23.7 25.8-40.5 20.2s-25.8-23.7-20.2-40.5l2.6-7.8c11.4-34.1 36.6-61.9 69.4-76.5l8-3.5c20.8-9.2 43.3-14 66.1-14c44.6 0 84.8 26.8 101.9 67.9L281 232.7l21.4 10.7c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3L247 287.3c-10.3-5.2-18.4-13.8-22.8-24.5l-9.6-23-19.3 65.5 49.5 54c5.4 5.9 9.2 13 11.2 20.8l23 92.1c4.3 17.1-6.1 34.5-23.3 38.8s-34.5-6.1-38.8-23.3l-22-88.1-70.7-77.1c-14.8-16.1-20.3-38.6-14.7-59.7l16.9-63.5zM68.7 398l25-62.4c2.1 3 4.5 5.8 7 8.6l40.7 44.4-14.5 36.2c-2.4 6-6 11.5-10.6 16.1L54.6 502.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L68.7 398z"/></svg>
                    </div>
                `;
            } else if (routeContainer) {
                routeContainer.innerHTML = `<span style="color: #ef4444; font-size: 0.75rem;">Sin ruta</span>`;
            }
        } catch (e) {
            // Fallback if location is denied: center on stop (as before)
            const offset = map.project([parada.lat, parada.lon]).subtract([0, 50]);
            const newCenter = map.unproject(offset);
            map.setView(newCenter, 16);

            const routeContainer = bottomSheetCard.querySelector('#route-info-container');
            if (routeContainer) {
                routeContainer.innerHTML = `<span style="color: #f59e0b; font-size: 0.75rem;">GPS denegado</span>`;
            }
        }
    };

    // Add Markers for Taxi Stops
    dbParadas.forEach(parada => {
        const icon = L.divIcon({
            className: 'custom-taxi-icon',
            html: `<div class="taxi-marker" style="width: 36px; height: 42px; border: 2px solid white; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0, 0.4); overflow: hidden; background: #1d4ed8;">
                    ${taxiSignSvg}
                   </div>`,
            iconSize: [36, 42],
            iconAnchor: [18, 21],
            popupAnchor: [0, -21]
        });

        const marker = L.marker([parada.lat, parada.lon], { icon }).addTo(map);
        allMarkers.push({ marker, parada });
        
        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            showOverlay(parada);
            
            const rect = mapElement.getBoundingClientRect();
            window.scrollTo({ top: rect.top + window.scrollY - 80, behavior: 'smooth' });
        });
    });

    // Initialize Filter Toggle
    const togglePills = rootElement.querySelectorAll('.taxi-scope-pill');
    togglePills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            togglePills.forEach(p => p.classList.remove('active'));
            const target = e.target as HTMLElement;
            target.classList.add('active');
            
            const filter = target.getAttribute('data-filter');
            if (filter === 'all') {
                hideOverlay();
                const allBounds = L.latLngBounds(dbParadas.map(p => [p.lat, p.lon]));
                map.fitBounds(allBounds, { paddingBottomRight: [0, 320], paddingTopLeft: [0, 180] });
            } else if (filter === 'nearest') {
                const originalText = target.innerText;
                target.innerText = "Buscando...";
                
                getUserLocation()
                    .then((loc) => {
                        target.innerText = originalText;
                        hideOverlay();
                        map.setView([loc.lat, loc.lon], 15);
                    })
                    .catch((error) => {
                        target.innerText = originalText;
                        console.error("Error getting location", error);
                        alert("No hemos podido acceder a tu ubicación o tu navegador no soporta geolocalización.");
                        target.classList.remove('active');
                        rootElement.querySelector('[data-filter="all"]')?.classList.add('active');
                        map.setView([36.529, -6.292], 13);
                    });
            }
        });
    });

    (window as any).cadizTaxiMap = map;
};
