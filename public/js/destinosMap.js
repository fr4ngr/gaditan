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
        L.marker([originLat, originLon], { icon: userIcon }).addTo(mapInstance);

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
                
                polylines[type] = L.polyline(coordinates, {
                    color: '#06b6d4',
                    weight: 5,
                    opacity: 0.8,
                    dashArray: '10, 10',
                    lineJoin: 'round'
                }).addTo(maps[type]);

                destinationMarkers[type] = L.marker([destLat, destLon], { icon: customIcon }).addTo(maps[type]);
                
                // Ajustar vista para mostrar toda la ruta con un poco de padding
                maps[type].fitBounds(polylines[type].getBounds(), { padding: [50, 50], maxZoom: 14 });
            }
        } catch (error) {
            console.error('Error calculando ruta al destino:', error);
            // Fallback: solo mover el mapa y poner el pin
            destinationMarkers[type] = L.marker([destLat, destLon], { icon: customIcon }).addTo(maps[type]);
            const bounds = L.latLngBounds([[originLat, originLon], [destLat, destLon]]);
            maps[type].fitBounds(bounds, { padding: [50, 50] });
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
                overlay.innerHTML = `
                    <div style="background: rgba(17, 24, 39, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 20px; padding: 1rem; color: white; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.7rem; font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px;">Destino Seleccionado</span>
                        </div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: white;">${dest.name}</div>
                    </div>
                `;
                overlay.style.display = 'block';
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
