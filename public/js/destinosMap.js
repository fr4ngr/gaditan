// destinosMap.js
// Lógica para inicializar y actualizar los mapas de las secciones de destinos

const destinosMapManager = (() => {
    let maps = {
        aeropuertos: null,
        favoritos: null
    };
    let polylines = {
        aeropuertos: null,
        favoritos: null
    };
    let destinationMarkers = {
        aeropuertos: null,
        favoritos: null
    };
    
    // Cadiz center
    const originLat = 36.529;
    const originLon = -6.292;

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#06b6d4" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#111827"></circle></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    const userIcon = L.divIcon({
        className: 'user-div-icon',
        html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    const initMap = (type) => {
        if (maps[type]) return maps[type];
        
        const mapElementId = `map-${type}`;
        const mapElement = document.getElementById(mapElementId);
        if (!mapElement || typeof L === 'undefined') return null;

        const mapInstance = L.map(mapElementId, {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile,
            tap: false
        }).setView([originLat, originLon], 13);
        
        L.control.attribution({ position: 'bottomleft' }).addTo(mapInstance);
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapInstance);

        // Añadir marcador de origen (Cádiz)
        L.marker([originLat, originLon], { icon: customIcon }).addTo(mapInstance);

        maps[type] = mapInstance;
        return mapInstance;
    };

    const fetchRoute = async (type, destLat, destLon) => {
        try {
            // Limpiar ruta anterior
            if (polylines[type]) {
                maps[type].removeLayer(polylines[type]);
            }
            if (destinationMarkers[type]) {
                maps[type].removeLayer(destinationMarkers[type]);
            }

            // OSRM espera lon,lat
            const url = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error fetching route');
            
            const data = await response.json();
            if (data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Leaflet usa lat,lon
                
                // Línea de borde oscuro (sombra nativa)
                const outerLine = L.polyline(coordinates, {
                    color: '#083344', // Dark blue/cyan
                    weight: 8,
                    opacity: 0.6,
                    lineJoin: 'round',
                    lineCap: 'round'
                }).addTo(maps[type]);

                // Línea central sólida y nítida (estilo Android)
                const innerLine = L.polyline(coordinates, {
                    color: '#06b6d4', // Cyan
                    weight: 5,
                    opacity: 1,
                    lineJoin: 'round',
                    lineCap: 'round'
                }).addTo(maps[type]);
                
                polylines[type] = L.layerGroup([outerLine, innerLine]).addTo(maps[type]);

                destinationMarkers[type] = L.marker([destLat, destLon], { icon: customIcon }).addTo(maps[type]);
                
                // Ajustar vista con padding superior para la píldora, y padding inferior/derecho para los botones de zoom
                maps[type].fitBounds(polylines[type].getBounds(), { 
                    paddingTopLeft: [50, 150], 
                    paddingBottomRight: [50, 100], 
                    maxZoom: 14 
                });
            }
        } catch (error) {
            console.error('Error calculando ruta al destino:', error);
            // Fallback: solo mover el mapa y poner el pin
            destinationMarkers[type] = L.marker([destLat, destLon], { icon: customIcon }).addTo(maps[type]);
            const bounds = L.latLngBounds([[originLat, originLon], [destLat, destLon]]);
            maps[type].fitBounds(bounds, { 
                paddingTopLeft: [50, 150], 
                paddingBottomRight: [50, 100] 
            });
        }
    };

    const render = (dest, type) => {
        const mapInstance = initMap(type);
        if (!mapInstance) return;

        // Invalida tamaño para asegurar que Leaflet renderice correctamente después de un display:block
        setTimeout(() => {
            mapInstance.invalidateSize();
            
            if (dest.lat && dest.lon) {
                fetchRoute(type, dest.lat, dest.lon);
            }
            
            // Actualizar overlay info en el mapa
            const overlay = document.getElementById(`map-overlay-info-${type}`);
            if (overlay) {
                const badgeText = type === 'aeropuertos' ? 'TRASLADO A AEROPUERTO' : 'DESTINO FAVORITO';
                overlay.innerHTML = `
                    <div style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 9999px; padding: 0.85rem 1.25rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                        <div style="display: flex; align-items: center; gap: 0.85rem; width: 100%;">
                            <i data-lucide="map-pin" style="color: var(--brand-cyan); width: 28px; height: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); flex-shrink: 0;"></i>
                            <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: center;">
                                <span style="color: var(--brand-cyan); font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.15rem;">${badgeText}</span>
                                <strong style="color: #fff; font-size: 1.1rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${dest.name}</strong>
                                ${dest.time ? `<span style="color: rgba(255,255,255,0.7); font-size: 0.8rem; margin-top: 0.1rem;">Tiempo estimado: ${dest.time}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                overlay.style.display = 'block';
                if (typeof lucide !== 'undefined') lucide.createIcons();
                setTimeout(() => {
                    overlay.style.transform = 'translateY(0)';
                    overlay.style.opacity = '1';
                }, 50);
            }
        }, 100);
    };

    return {
        render
    };
})();

// Exponer la función global para components.js
window.renderDestinoMap = destinosMapManager.render;
