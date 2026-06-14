// Gestor del Mapa Interactivo (Leaflet + OSRM)
const mapManager = (() => {
    let map = null;
    let markersLayer = null;
    let userMarker = null;
    let routePolyline = null;
    let currentMode = 'todas'; // 'todas' | 'cercana' | 'elegir'
    let userLocation = null; // { lat, lon }
    let selectedParada = null;
    
    // Configuración visual de pines
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
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile,
            tap: false
        }).setView([36.529, -6.292], 13);
        
        L.control.attribution({ position: 'bottomright' }).addTo(map);
        
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);

        // Control de localización tipo mirilla
        const LocateControl = L.Control.extend({
            options: { position: 'bottomright' },
            onAdd: function() {
                const btn = L.DomUtil.create('button', 'map-locate-btn');
                btn.title = 'Localizar parada más cercana';
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>`;
                btn.style.cssText = `
                    background: rgba(15, 23, 42, 0.85);
                    border: 1px solid rgba(6, 182, 212, 0.4);
                    border-radius: 50%;
                    width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    color: #06b6d4;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    transition: all 0.2s;
                    padding: 0;
                `;
                btn.onmouseover = () => { btn.style.background = 'rgba(6, 182, 212, 0.2)'; btn.style.borderColor = '#06b6d4'; };
                btn.onmouseout  = () => { btn.style.background = 'rgba(15, 23, 42, 0.85)'; btn.style.borderColor = 'rgba(6, 182, 212, 0.4)'; };
                L.DomEvent.on(btn, 'click', L.DomEvent.stopPropagation);
                L.DomEvent.on(btn, 'click', () => setMode('cercana'));
                return btn;
            }
        });
        new LocateControl().addTo(map);

        document.getElementById('btn-todas').addEventListener('click', () => setMode('todas'));
        document.getElementById('btn-cercana').addEventListener('click', () => setMode('cercana'));

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
            marker.on('click', () => {
                selectedParada = p;
                map.flyToBounds([[p.lat, p.lon], [p.lat, p.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });

                const selectedIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 0 8px rgba(250,204,21,0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="#facc15" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#111827"></circle></svg></div>`,
                    iconSize: [38, 38],
                    iconAnchor: [19, 38]
                });
                marker.setIcon(selectedIcon);
                setTimeout(() => marker.setIcon(customIcon), 1500);

                if (userLocation) {
                    if (p.distance === undefined) p.distance = getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon);
                    fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
                }

                renderMapOverlay(p);
                setTimeout(() => { if (map) map.invalidateSize(); }, 400);

                if (currentMode === 'todas') {
                    const listContainer = document.getElementById('paradas-list-container');
                    if (listContainer) {
                        listContainer.innerHTML = '';
                        listContainer.appendChild(buildSelectedStopWidget(p));
                    }
                }
            });
        });
    };


    const getListItemHtml = (p) => {
        let distHtml = '';
        if (p.distance !== undefined) {
            const timeMins = Math.max(1, Math.ceil(p.distance / 0.08));
            distHtml = `<div style="font-size: 0.7rem; color: var(--brand-cyan); font-weight: 600; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.15rem;"><i data-lucide="footprints" style="width:12px; height:12px;"></i> ${formatDistance(p.distance)} &bull; ${timeMins} min a pie</div>`;
        }
        return `
            <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0; flex: 1;">
                <i data-lucide="map-pin" style="width:20px; height:20px; color: var(--brand-cyan); flex-shrink: 0;"></i>
                <div style="display: flex; flex-direction: column; min-width: 0;">
                    <strong style="color: #fff; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</strong>
                    <span style="color: var(--text-muted); font-size: 0.72rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.address}</span>
                    ${distHtml}
                </div>
            </div>
            <div class="plus-icon-btn" style="background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.35); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem; font-weight: 700; color: var(--brand-cyan); margin-left: 0.5rem; transition: all 0.3s ease;">+</div>
        `;
    };

    const buildListItem = (p) => {
        const item = document.createElement('div');
        item.className = 'pildora-hover';
        item.style.cssText = `
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.65rem 0.9rem; border-radius: 9999px; cursor: pointer;
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            margin-bottom: 0.55rem; transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
            overflow: hidden;
        `;
        item.onmouseover = () => { item.style.background = 'rgba(6,182,212,0.08)'; item.style.borderColor = 'rgba(6,182,212,0.3)'; };
        item.onmouseout  = () => { item.style.background = 'rgba(255,255,255,0.04)'; item.style.borderColor = 'rgba(255,255,255,0.08)'; };
        item.ontouchstart = () => { item.style.transform = 'scale(0.98)'; };
        item.ontouchend   = () => { item.style.transform = 'scale(1)'; };
        item.innerHTML = getListItemHtml(p);


        item.addEventListener('click', () => {
            selectedParada = p;
            map.flyToBounds([[p.lat, p.lon], [p.lat, p.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });
            markersLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === p.lat && layer.getLatLng().lng === p.lon) {
                    const selectedIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 0 8px rgba(250,204,21,0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="#facc15" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#111827"></circle></svg></div>`,
                        iconSize: [38, 38],
                        iconAnchor: [19, 38]
                    });
                    layer.setIcon(selectedIcon);
                    setTimeout(() => layer.setIcon(customIcon), 1500);
                }
            });
            
            if (userLocation) {
                if (p.distance === undefined) p.distance = getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon);
                fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
            }

            renderMapOverlay(p);
            setTimeout(() => { if (map) map.invalidateSize(); }, 400);

            const listContainer = document.getElementById('paradas-list-container');
            if (listContainer) {
                listContainer.innerHTML = '';
                listContainer.appendChild(buildSelectedStopWidget(p));
            }
            
            // Smooth scroll to map
            setTimeout(() => {
                const paradasSection = document.getElementById('paradas');
                if (paradasSection) {
                    paradasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 50);
        });
        return item;
    };

    const buildPlainListItem = (p) => {
        const item = document.createElement('div');
        item.className = 'pildora-hover';
        item.style.cssText = `
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.65rem 0.9rem; border-radius: 9999px; cursor: pointer;
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            margin-bottom: 0.55rem; transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
            overflow: hidden;
        `;
        item.onmouseover = () => { item.style.background = 'rgba(6,182,212,0.08)'; item.style.borderColor = 'rgba(6,182,212,0.3)'; };
        item.onmouseout  = () => { item.style.background = 'rgba(255,255,255,0.04)'; item.style.borderColor = 'rgba(255,255,255,0.08)'; };
        item.ontouchstart = () => { item.style.transform = 'scale(0.98)'; };
        item.ontouchend   = () => { item.style.transform = 'scale(1)'; };
        
        let distHtml = '';
        if (p.distance !== undefined) {
            const timeMins = Math.max(1, Math.ceil(p.distance / 0.08));
            distHtml = `<div style="font-size: 0.7rem; color: var(--brand-cyan); font-weight: 600; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.15rem;"><i data-lucide="footprints" style="width:12px; height:12px;"></i> ${formatDistance(p.distance)} &bull; ${timeMins} min a pie</div>`;
        }

        let badgHtml = p.nocturna ? `<span style="background: rgba(239, 68, 68, 0.15); color: #fca5a5; font-size: 0.6rem; font-weight: 800; padding: 0.15rem 0.4rem; border-radius: 4px; margin-left: 0.4rem; border: 1px solid rgba(239, 68, 68, 0.3); vertical-align: middle;">NOCTURNA</span>` : '';

        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0; flex: 1;">
                <i data-lucide="map-pin" style="width:20px; height:20px; color: var(--brand-cyan); flex-shrink: 0;"></i>
                <div style="display: flex; flex-direction: column; min-width: 0;">
                    <strong style="color: #fff; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center;">${p.name}${badgHtml}</strong>
                    <span style="color: var(--text-muted); font-size: 0.72rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.address}</span>
                    ${distHtml}
                </div>
            </div>
            <div class="plus-icon-btn" style="background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.35); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem; font-weight: 700; color: var(--brand-cyan); margin-left: 0.5rem; transition: all 0.3s ease;">+</div>
        `;
        item.addEventListener('click', () => {
            selectedParada = p;
            map.flyToBounds([[p.lat, p.lon], [p.lat, p.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });
            markersLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === p.lat && layer.getLatLng().lng === p.lon) {
                    const selectedIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 0 8px rgba(250,204,21,0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="#facc15" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#111827"></circle></svg></div>`,
                        iconSize: [38, 38],
                        iconAnchor: [19, 38]
                    });
                    layer.setIcon(selectedIcon);
                    setTimeout(() => layer.setIcon(customIcon), 1500);
                }
            });
            
            if (userLocation) {
                if (p.distance === undefined) p.distance = getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon);
                fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
            }

            renderMapOverlay(p);
            setTimeout(() => { if (map) map.invalidateSize(); }, 400);

            const listContainer = document.getElementById('paradas-list-container');
            if (listContainer) {
                listContainer.innerHTML = '';
                listContainer.appendChild(buildSelectedStopWidget(p));
            }
            
            // Smooth scroll to map
            setTimeout(() => {
                const paradasSection = document.getElementById('paradas');
                if (paradasSection) {
                    paradasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 50);
        });
        return item;
    };

    const renderMapOverlay = (p) => {
        const overlay = document.getElementById('map-overlay-info');
        if (!overlay) return;
        
        let banners = [];
        if (p.distance !== undefined) {
            const straightDist = p.distance * 1000;
            const walkMins = Math.max(1, Math.round(straightDist / 83.3));
            let timeStr = walkMins + ' min';
            if (walkMins >= 60) {
                const h = Math.floor(walkMins / 60);
                const m = walkMins % 60;
                timeStr = m > 0 ? `${h}h ${m}min` : `${h}h`;
            }
            const distStr = straightDist < 1000 ? Math.round(straightDist) + ' m' : (straightDist / 1000).toFixed(1) + ' km';
            
            banners.push(`
                <div id="walk-info-pill" style="background-color: #10b981; color: white; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 0.5rem 1.5rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; border-top: 1px solid rgba(255,255,255,0.2);">
                    <i data-lucide="navigation" style="width:14px; height:14px;"></i> A ${distStr} <span style="opacity: 0.5; margin: 0 0.2rem;">-</span> <i data-lucide="footprints" style="width:14px; height:14px;"></i> ${timeStr} APROX
                </div>
            `);
        }
        
        if (p.nocturna) {
            banners.push(`
                <div style="background-color: #ef4444; color: white; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 0.5rem 1.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
                    <i data-lucide="moon" style="width: 14px; height: 14px;"></i> PARADA NOCTURNA SÓLO DE 22 A 7H
                </div>
            `);
        }
        
        let bannersHtml = '';
        if (banners.length > 0) {
            bannersHtml = `
                <div style="margin: 1.25rem -1.5rem -1.25rem -1.5rem; display: flex; flex-direction: column;">
                    ${banners.join('')}
                </div>
            `;
        }
        
        overlay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.85rem; width: 100%;">
                <!-- Icono sin fondo -->
                <i data-lucide="map-pin" style="color: #0f172a; width: 32px; height: 32px; flex-shrink: 0;"></i>
                <!-- Textos a la derecha -->
                <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: center;">
                    <span style="color: rgba(15, 23, 42, 0.7); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.15rem;">PARADA DE TAXI</span>
                    <strong style="color: #0f172a; font-size: 1.3rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${p.name}</strong>
                    <span style="color: rgba(15, 23, 42, 0.85); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.1rem;">${p.address}, Cádiz</span>
                </div>
            </div>
            ${bannersHtml}
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        overlay.style.display = 'block';
        requestAnimationFrame(() => {
            overlay.style.padding = '1.25rem 1.5rem';
            overlay.style.maxHeight = '200px';
            overlay.style.opacity = '1';
        });
    };

    const hideMapOverlay = () => {
        const overlay = document.getElementById('map-overlay-info');
        if (overlay) {
            overlay.style.maxHeight = '0';
            overlay.style.opacity = '0';
            overlay.style.padding = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 400); // Wait for transition
        }
    };

    const buildSelectedStopWidget = (p) => {
        const item = document.createElement('div');
        item.style.cssText = `display: flex; flex-direction: column; width: 100%;`;
        
        // 2. Tarjeta Taxis Oficiales + Alternativas
        const content = `
            <!-- Opción Taxis Oficiales -->
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                    <div style="width: 100%;">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 0.6rem;">
                                <div style="background: linear-gradient(135deg, #ffffff 44%, #b81d33 44%, #b81d33 56%, #ffffff 56%); color: #0f172a; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.65rem; box-shadow: 0 0 0 1px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2); text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 2px #fff;"></div>
                                <div style="display: flex; flex-direction: column;">
                                    <div style="color: #fff; font-weight: 600; font-size: 1.1rem;">Taxi Oficial</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.6rem;">
                                <a href="tel:+34956212121" aria-label="Llamar" style="width: 44px; height: 44px; border-radius: 50%; background: #06b6d4; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s ease;">
                                    <i data-lucide="phone" style="width: 20px; height: 20px; color: white;"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

            
            <!-- Separador OTRAS OPCIONES -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0;">
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));"></div>
                <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; white-space: nowrap;">OTRAS OPCIONES</span>
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent);"></div>
            </div>

            <!-- Opción VTC Alternativa -->
            <div class="cadizcab-card-hover" style="background: linear-gradient(145deg, rgba(123, 72, 250, 0.15), rgba(99, 102, 241, 0.05)); border: 1px solid rgba(123, 72, 250, 0.4); box-shadow: 0 8px 32px rgba(123, 72, 250, 0.15); border-radius: 30px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden; margin-bottom: 0.85rem; opacity: 0;">
                <!-- Efecto brillo superior -->
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #7b48fa, transparent);"></div>
                <!-- Badge -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <i data-lucide="star" style="color: #eab308; width: 14px; height: 14px; fill: #eab308;"></i>
                        <span style="color: #eab308; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">FAVORITO</span>
                    </div>
                    <div style="background: #eab308; color: #111827; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);">PREMIUM</div>
                </div>
                
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <div style="font-size: 1.3rem; font-weight: 800; color: white; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.02em;">
                        <div style="background: #7b48fa; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="car" style="width:14px; height:14px; color: white;"></i></div>
                        cadiz.cab
                    </div>
                    <div style="font-size: 0.85rem; color: #a78bfa; font-weight: 500; margin-top: 0.2rem; margin-left: 2.2rem;">Vehículos VTC</div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.4rem; padding: 0.75rem 0; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); margin-top: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: #10b981;"></i>
                        <span style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">Precio cerrado anticipado</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: #10b981;"></i>
                        <span style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">Sin esperas en la parada</span>
                    </div>
                </div>
                
                <a href="https://cadiz.cab" target="_blank" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #7b48fa, #6366f1); color: white; padding: 1rem; border-radius: 9999px; margin-top: 0.5rem; text-decoration: none; font-weight: 800; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(123, 72, 250, 0.4); border: none; transition: all 0.3s ease;">
                    <i data-lucide="calendar-check" style="width: 20px; height: 20px;"></i> Reservar
                </a>
            </div>

            <!-- Separador TRANSPORTE PÚBLICO -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0;">
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));"></div>
                <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; white-space: nowrap;">Transporte público</span>
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent);"></div>
            </div>

            <!-- Opción Autobús Urbano -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: linear-gradient(to bottom, #fdf6e3 0%, #fdf6e3 47%, #ea580c 47%, #ea580c 53%, #059669 53%, #059669 100%); width: 26px; height: 26px; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);"></div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Autobús Urbano</span>
                        <div style="background: white; color: #111827; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; margin-left: 0.2rem;">1</div>
                        <div style="background: white; color: #111827; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800;">3</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #fde047;"></i>
                </div>
            </a>

            <!-- Opción Tren -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(142, 68, 173, 0.15); border: 1px solid rgba(142, 68, 173, 0.4); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: #8e44ad; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; font-family: sans-serif; color: white; padding-bottom: 2px;">r</div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Tren</span>
                        <div style="background: #ef4444; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; margin-left: 0.2rem;">C</div>
                        <div style="background: #f97316; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800;">MD</div>
                        <div style="background: #3b82f6; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800;">LG</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #a855f7;"></i>
                </div>
            </a>

            <!-- Opción Tranvía -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: #10b981; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; color: white;">T</div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Tranvía</span>
                        <div style="background: white; color: #065f46; padding: 0.1rem 0.5rem; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; margin-left: 0.2rem; text-transform: uppercase;">A Chiclana</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #d1d5db;"></i>
                </div>
            </a>

            <!-- Opción Autobús Interurbano -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 102, 77, 0.15); border: 1px solid rgba(0, 102, 77, 0.4); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: #00664d; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; color: white; letter-spacing: -0.5px;">C</div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Autobús Interurbano</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #34d399;"></i>
                </div>
            </a>
        `;

        item.innerHTML = content;
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
                <div class="glass" style="margin-top: 1rem; padding: 1.5rem; border-radius: 30px;">
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

            const pill = document.getElementById('walk-info-pill');
            if (pill) {
                const walkDist = route.distance;
                const walkSecs = route.duration;
                const walkMins = Math.max(1, Math.round(walkSecs / 60));
                let timeStr = walkMins + ' min';
                if (walkMins >= 60) {
                    const h = Math.floor(walkMins / 60);
                    const m = walkMins % 60;
                    timeStr = m > 0 ? `${h}h ${m}min` : `${h}h`;
                }
                const distStr = walkDist < 1000 ? Math.round(walkDist) + ' m' : (walkDist / 1000).toFixed(1) + ' km';
                pill.innerHTML = `<i data-lucide="navigation" style="width:14px; height:14px;"></i> A ${distStr} <span style="opacity: 0.5; margin: 0 0.2rem;">-</span> <i data-lucide="footprints" style="width:14px; height:14px;"></i> ${timeStr} CAMINANDO`;
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

    const updateVisibleParadas = () => {
        if (currentMode !== 'todas' || !map || selectedParada !== null) return;
        const bounds = map.getBounds();
        const visibleParadas = dbParadas.filter(p => bounds.contains([p.lat, p.lon]));
        currentPage = 1;
        renderPaginatedList(visibleParadas);
    };

    const setMode = (mode) => {
        currentMode = mode;
        const btnTodas = document.getElementById('btn-todas');
        const btnCercana = document.getElementById('btn-cercana');
        
        clearRoute();
        
        if(btnTodas) btnTodas.classList.remove('active');
        if(btnCercana) btnCercana.classList.remove('active');
        
        if (mode === 'todas') {
            selectedParada = null;
            if(btnTodas) btnTodas.classList.add('active');
            
            hideMapOverlay();
            
            renderMarkers(dbParadas);
            // No renderizar inmediatamente todas si vamos a hacer flyToBounds, 
            // pero para evitar parpadeos renderizamos visibles actualmente
            updateVisibleParadas();
            
            if (userMarker) {
                map.removeLayer(userMarker);
                userMarker = null;
            }
            
            setTimeout(() => { 
                if (map) {
                    map.invalidateSize();                    
                    const bounds = L.latLngBounds(dbParadas.map(p => [p.lat, p.lon]));
                    map.flyToBounds(bounds, { padding: [20, 20], animate: true, duration: 1.0, easeLinearity: 0.25 });
                }
            }, 400);
            
            // Listen for moveend to update the list
            map.off('moveend', updateVisibleParadas);
            map.on('moveend', updateVisibleParadas);

        } else if (mode === 'cercana') {
            if(btnCercana) btnCercana.classList.add('active');
            
            // Remove the moveend listener for list updating when not in 'todas' mode
            map.off('moveend', updateVisibleParadas);
            
            setTimeout(() => { if (map) map.invalidateSize(); }, 400);
            
            if (navigator.geolocation) {
                document.getElementById('paradas-list-container').innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);"><i data-lucide="loader-2" class="spin" style="animation: spin 1s linear infinite;"></i> Localizando...</div>';
                if (typeof lucide !== 'undefined') lucide.createIcons();

                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    userLocation = { lat, lon };
                    
                    if (userMarker) map.removeLayer(userMarker);
                    userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
                    userMarker.bindPopup("Tu ubicación actual");

                    const paradasConDistancia = dbParadas.map(p => {
                        return { ...p, distance: getDistance(lat, lon, p.lat, p.lon) };
                    }).sort((a, b) => a.distance - b.distance);
                    
                    const masCercana = paradasConDistancia[0];
                    renderMarkers(paradasConDistancia);
                    
                    const container = document.getElementById('paradas-list-container');
                    if (container) {
                        container.innerHTML = '';
                        container.appendChild(buildSelectedStopWidget(masCercana));
                        renderMapOverlay(masCercana);
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }
                    
                    const bounds = L.latLngBounds([
                        [lat, lon],
                        [masCercana.lat, masCercana.lon]
                    ]);
                    
                    map.flyToBounds(bounds, { paddingTopLeft: [20, 180], paddingBottomRight: [20, 20], animate: true, duration: 1.2, easeLinearity: 0.25 });

                    fetchRoute(lat, lon, masCercana.lat, masCercana.lon);


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

