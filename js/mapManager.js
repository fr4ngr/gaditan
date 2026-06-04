// Gestor del Mapa Interactivo (Leaflet + OSRM)
const mapManager = (() => {
    let map = null;
    let markersLayer = null;
    let userMarker = null;
    let routePolyline = null;
    let currentMode = 'todas'; // 'todas' | 'cercana' | 'elegir'
    let userLocation = null; // { lat, lon }
    
    // Configuración visual de pines
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: var(--brand-cyan); width: 24px; height: 24px; border-radius: 50%; border: 3px solid #111827; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    });

    const userIcon = L.divIcon({
        className: 'user-div-icon',
        html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c;
    };

    const formatDistance = (distKm) => {
        if (distKm < 1) {
            return Math.round(distKm * 1000) + ' m';
        }
        return distKm.toFixed(1) + ' km';
    };

    const init = () => {
        const mapElement = document.getElementById('map');
        if (!mapElement || typeof L === 'undefined') return;

        map = L.map('map', {
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile,
            tap: false
        }).setView([36.529, -6.292], 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);

        document.getElementById('btn-todas').addEventListener('click', () => setMode('todas'));
        document.getElementById('btn-cercana').addEventListener('click', () => setMode('cercana'));
        document.getElementById('btn-elegir').addEventListener('click', () => setMode('elegir'));

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setMode('todas');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: "200px" });
        observer.observe(mapElement);
    };

    const renderMarkers = (paradas) => {
        markersLayer.clearLayers();
        paradas.forEach(p => {
            const marker = L.marker([p.lat, p.lon], { icon: customIcon }).addTo(markersLayer);
            marker.bindPopup(`<strong>${p.name}</strong><br>${p.address}`);
            marker.on('click', () => {
                map.flyTo([p.lat, p.lon], 17);
                if (currentMode === 'cercana' && userLocation) {
                    fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
                }
            });
        });
    };

    const getListItemHtml = (p) => {
        let distHtml = '';
        if (p.distance !== undefined) {
            distHtml = `<div style="font-size: 0.75rem; color: var(--brand-cyan); font-weight: 600; display: flex; align-items: center; gap: 0.2rem;"><i data-lucide="footprints" style="width:14px; height:14px;"></i> ${formatDistance(p.distance)}</div>`;
        }
        return `
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                <strong style="color: #fff; font-size: 0.95rem;">${p.name}</strong>
                <span style="color: var(--text-muted); font-size: 0.8rem;">${p.address}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem;">
                ${distHtml}
                <button class="md3-btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: rgba(123, 72, 250, 0.15); color: #e9d5ff; border: 1px solid rgba(123, 72, 250, 0.4); border-radius: 999px;">
                    Ver mapa
                </button>
            </div>
        `;
    };

    const buildListItem = (p) => {
        const item = document.createElement('div');
        item.className = 'glass';
        item.style.cssText = `
            display: flex; align-items: center; justify-content: space-between; 
            padding: 1rem; border-radius: 16px; cursor: pointer; 
            transition: background 0.3s ease; border: 1px solid var(--glass-border); margin-bottom: 0.8rem;
        `;
        item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.08)';
        item.onmouseout = () => item.style.background = 'rgba(255,255,255,0.03)';
        item.innerHTML = getListItemHtml(p);
        
        item.addEventListener('click', () => {
            document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
            map.flyTo([p.lat, p.lon], 17);
            markersLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === p.lat && layer.getLatLng().lng === p.lon) {
                    layer.openPopup();
                }
            });
            if (currentMode === 'cercana' && userLocation) {
                fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
            }
        });
        return item;
    };

    const buildPlainListItem = (p) => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 0.8rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
            cursor: pointer; transition: padding-left 0.2s ease;
        `;
        item.onmouseover = () => item.style.paddingLeft = '5px';
        item.onmouseout = () => item.style.paddingLeft = '0px';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="map-pin" style="color: var(--brand-cyan); width: 16px; height: 16px; flex-shrink: 0;"></i>
                <div>
                    <div style="color: #fff; font-size: 0.95rem; font-weight: 500;">${p.name}</div>
                    <div style="color: var(--text-muted); font-size: 0.8rem;">${p.address}</div>
                </div>
            </div>
        `;
        item.addEventListener('click', () => {
            document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
            map.flyTo([p.lat, p.lon], 17);
            markersLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === p.lat && layer.getLatLng().lng === p.lon) {
                    layer.openPopup();
                }
            });
        });
        return item;
    };

    const renderList = (paradas) => {
        const container = document.getElementById('paradas-list-container');
        if (!container) return;
        container.innerHTML = '';
        paradas.forEach(p => container.appendChild(buildListItem(p)));
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    let currentPage = 1;
    const itemsPerPage = 5;

    const renderPaginatedList = (paradas) => {
        const container = document.getElementById('paradas-list-container');
        if (!container) return;
        container.innerHTML = '';

        const totalPages = Math.ceil(paradas.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const pageItems = paradas.slice(start, start + itemsPerPage);

        // Render clean text items without glass wrapper
        const listWrapper = document.createElement('div');
        listWrapper.style.cssText = "margin-bottom: 1rem;";
        pageItems.forEach(p => listWrapper.appendChild(buildPlainListItem(p)));
        container.appendChild(listWrapper);

        // Paginador
        if (totalPages > 1) {
            const pager = document.createElement('div');
            pager.style.cssText = "display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-top: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 999px; border: 1px solid var(--glass-border); width: fit-content; margin-left: auto; margin-right: auto;";
            
            const btnPrev = document.createElement('button');
            btnPrev.style.cssText = "flex: none; width: 44px; height: 44px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--glass-border); border: none; color: #fff; cursor: pointer; transition: opacity 0.2s; opacity: " + (currentPage === 1 ? "0.3" : "1");
            btnPrev.innerHTML = `<i data-lucide="chevron-left" style="margin:0; pointer-events: none;"></i>`;
            btnPrev.disabled = currentPage === 1;
            btnPrev.onclick = () => { if(currentPage > 1) { currentPage--; renderPaginatedList(paradas); } };
            
            const info = document.createElement('span');
            info.style.cssText = "color: var(--text-muted); font-size: 0.9rem; font-weight: 600; min-width: 70px; text-align: center;";
            info.innerText = `Pág ${currentPage} de ${totalPages}`;

            const btnNext = document.createElement('button');
            btnNext.style.cssText = "flex: none; width: 44px; height: 44px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--glass-border); border: none; color: #fff; cursor: pointer; transition: opacity 0.2s; opacity: " + (currentPage === totalPages ? "0.3" : "1");
            btnNext.innerHTML = `<i data-lucide="chevron-right" style="margin:0; pointer-events: none;"></i>`;
            btnNext.disabled = currentPage === totalPages;
            btnNext.onclick = () => { if(currentPage < totalPages) { currentPage++; renderPaginatedList(paradas); } };

            pager.appendChild(btnPrev);
            pager.appendChild(info);
            pager.appendChild(btnNext);
            container.appendChild(pager);
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    const renderElegirView = (paradas) => {
        const topContainer = document.getElementById('elegir-select-container');
        const bottomContainer = document.getElementById('paradas-list-container');
        if (!topContainer || !bottomContainer) return;
        
        topContainer.innerHTML = '';
        bottomContainer.innerHTML = '';
        topContainer.style.display = 'block';

        // Select nativo pero estilizado (sin tarjeta, diseño suelto)
        const selectContainer = document.createElement('div');
        selectContainer.style.cssText = "position: relative; width: 100%;";
        
        const select = document.createElement('select');
        select.style.cssText = "width: 100%; padding: 1rem 3rem 1rem 1.2rem; border-radius: 999px; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid rgba(255,255,255,0.1); font-size: 1rem; appearance: none; outline: none; cursor: pointer; font-family: inherit; box-shadow: 0 4px 6px rgba(0,0,0,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);";
        
        const chevron = document.createElement('i');
        chevron.setAttribute('data-lucide', 'chevron-down');
        chevron.style.cssText = "position: absolute; right: 1.2rem; top: 50%; transform: translateY(-50%); color: var(--brand-cyan); pointer-events: none;";

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.innerText = "Selecciona una parada";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        paradas.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.innerText = p.name;
            opt.style.color = "#000"; // For mobile native dropdowns this works best
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            const parada = paradas.find(p => p.id === selectedId);
            if (parada) {
                // Dibujar solo ESE pin
                renderMarkers([parada]);
                map.flyTo([parada.lat, parada.lon], 17);
                
                // Mostrar tarjeta abajo
                bottomContainer.innerHTML = '';
                bottomContainer.appendChild(buildListItem(parada));
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });

        selectContainer.appendChild(select);
        selectContainer.appendChild(chevron);
        topContainer.appendChild(selectContainer);
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    const clearRoute = () => {
        if (routePolyline) {
            map.removeLayer(routePolyline);
            routePolyline = null;
        }
        const dirContainer = document.getElementById('directions-container');
        if (dirContainer) dirContainer.innerHTML = '';
    };

    const fetchRoute = async (lat1, lon1, lat2, lon2) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/foot/${lon1},${lat1};${lon2},${lat2}?steps=true&geometries=geojson&overview=full&language=es`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return;
            
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map(c => [c[1], c[0]]);
            
            clearRoute();
            
            routePolyline = L.polyline(coordinates, {
                color: '#3b82f6',
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10',
                lineJoin: 'round'
            }).addTo(map);
            
            map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
            
            const dirContainer = document.getElementById('directions-container');
            if (dirContainer) {
                let stepsHtml = route.legs[0].steps.filter(s => s.maneuver.type !== "depart" && s.maneuver.type !== "arrive").map((step) => {
                    return `
                    <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 0.8rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 0.5rem; border-radius: 50%; color: #60a5fa;">
                            <i data-lucide="${getManeuverIcon(step.maneuver.type, step.maneuver.modifier)}" size="18"></i>
                        </div>
                        <div style="flex: 1;">
                            <p style="margin: 0; color: #fff; font-size: 0.9rem;">${step.maneuver.instruction}</p>
                            <small style="color: var(--text-muted); font-size: 0.75rem;">${Math.round(step.distance)} metros</small>
                        </div>
                    </div>`;
                }).join('');
                
                dirContainer.innerHTML = `
                <div class="glass" style="margin-top: 1rem; padding: 1.5rem; border-radius: 20px;">
                    <h3 style="margin-top: 0; margin-bottom: 1rem; color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="navigation" style="color: var(--brand-cyan);"></i> Ruta a pie (${formatDistance(route.distance/1000)} - ${Math.round(route.duration/60)} min)
                    </h3>
                    <div style="display: flex; flex-direction: column;">
                        ${stepsHtml}
                        <div style="display: flex; align-items: flex-start; gap: 1rem; padding-top: 0.8rem;">
                            <div style="background: rgba(16, 185, 129, 0.1); padding: 0.5rem; border-radius: 50%; color: #34d399;">
                                <i data-lucide="map-pin" size="18"></i>
                            </div>
                            <div style="flex: 1; display: flex; align-items: center;">
                                <p style="margin: 0; color: #34d399; font-weight: bold; font-size: 0.9rem;">Has llegado a la parada</p>
                            </div>
                        </div>
                    </div>
                </div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    const getManeuverIcon = (type, modifier) => {
        if (modifier && modifier.includes('left')) return 'corner-up-left';
        if (modifier && modifier.includes('right')) return 'corner-up-right';
        if (type === 'roundabout') return 'rotate-cw';
        return 'arrow-up';
    };

    const setMode = (mode) => {
        currentMode = mode;
        const btnTodas = document.getElementById('btn-todas');
        const btnCercana = document.getElementById('btn-cercana');
        const btnElegir = document.getElementById('btn-elegir');
        const selectContainer = document.getElementById('elegir-select-container');
        
        clearRoute();
        
        btnTodas.className = 'md3-btn md3-tonal';
        btnCercana.className = 'md3-btn md3-tonal';
        btnElegir.className = 'md3-btn md3-tonal';
        if (selectContainer) selectContainer.style.display = 'none';
        
        if (mode === 'todas') {
            btnTodas.className = 'md3-btn md3-primary';
            
            renderMarkers(dbParadas);
            currentPage = 1;
            renderPaginatedList(dbParadas);
            
            if (userMarker) {
                map.removeLayer(userMarker);
                userMarker = null;
                userLocation = null;
            }
            
            const bounds = L.latLngBounds(dbParadas.map(p => [p.lat, p.lon]));
            map.fitBounds(bounds, { padding: [20, 20] });
            
        } else if (mode === 'elegir') {
            btnElegir.className = 'md3-btn md3-primary';
            
            renderMarkers(dbParadas);
            renderElegirView(dbParadas);
            
            if (userMarker) {
                map.removeLayer(userMarker);
                userMarker = null;
                userLocation = null;
            }
            
            const bounds = L.latLngBounds(dbParadas.map(p => [p.lat, p.lon]));
            map.fitBounds(bounds, { padding: [20, 20] });

        } else if (mode === 'cercana') {
            btnCercana.className = 'md3-btn md3-primary';
            
            if (navigator.geolocation) {
                document.getElementById('paradas-list-container').innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);"><i data-lucide="loader-2" class="spin" style="animation: spin 1s linear infinite;"></i> Localizando...</div>';
                if (typeof lucide !== 'undefined') lucide.createIcons();

                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    if (lat < 36.47 || lat > 36.56 || lon < -6.33 || lon > -6.23) {
                        alert("Parece que no te encuentras en Cádiz capital. Mostrando todas las paradas.");
                        setMode('todas');
                        return;
                    }

                    userLocation = { lat, lon };
                    
                    if (userMarker) map.removeLayer(userMarker);
                    userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
                    userMarker.bindPopup("Tu ubicación actual");

                    const paradasConDistancia = dbParadas.map(p => {
                        return { ...p, distance: getDistance(lat, lon, p.lat, p.lon) };
                    }).sort((a, b) => a.distance - b.distance);
                    
                    const cercanas = paradasConDistancia.slice(0, 2); // Solo 2
                    renderMarkers(paradasConDistancia);
                    renderList(cercanas);
                    
                    const bounds = L.latLngBounds([
                        [lat, lon],
                        [cercanas[0].lat, cercanas[0].lon]
                    ]);
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

                }, (error) => {
                    console.error("Error geolocating:", error);
                    alert("No hemos podido acceder a tu ubicación. Comprueba los permisos de tu navegador.");
                    setMode('todas');
                }, { timeout: 10000 });
            } else {
                alert("Tu navegador no soporta geolocalización.");
                setMode('todas');
            }
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    mapManager.init();
});
