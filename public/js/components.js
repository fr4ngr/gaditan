// DESTINOS DATABASE Y COMPONENTES
const dbDestinos = {
    aeropuertos: [
        { id: "jerez", name: "Aeropuerto de Jerez", price: "55€", icon: "plane", time: "35 min" },
        { id: "sevilla", name: "Aeropuerto de Sevilla", price: "145€", icon: "plane", time: "1h 15 min" },
        { id: "malaga", name: "Aeropuerto de Málaga", price: "245€", icon: "plane", time: "2h 30 min" }
    ],
    favoritos: [
        { id: "tarifa", name: "Tarifa (Puerto)", price: "78€", icon: "map-pin", time: "1h 20 min" },
        { id: "bahia", name: "Bahía Sur (San Fernando)", price: "19€", icon: "map-pin", time: "15 min" },
        { id: "chiclana", name: "Chiclana (Centro)", price: "42€", icon: "map-pin", time: "25 min" },
        { id: "puerto", name: "El Puerto de Santa María", price: "19€", icon: "map-pin", time: "20 min" },
        { id: "areasur", name: "C.C. Área Sur (Jerez)", price: "29€", icon: "map-pin", time: "25 min" },
        { id: "rota", name: "Rota (Costa Ballena)", price: "35€", icon: "map-pin", time: "40 min" },
        { id: "sanlucar", name: "Sanlúcar de Barrameda", price: "39€", icon: "map-pin", time: "40 min" },
        { id: "vejer", name: "Vejer de la Frontera", price: "43€", icon: "map-pin", time: "45 min" }
    ]
};

function renderDestino(dest, gridType) {
    return `
    <div id="card-wrapper-${gridType}-${dest.id}" style="width: 100%;">
        <div class="mini-dest-card pildora-hover" id="card-header-${gridType}-${dest.id}" onclick="showDestinoDetails('${dest.id}', '${gridType}')" style="position: relative; margin-bottom: 0.5rem; cursor: pointer; display: flex; flex-direction: column;">
            <div class="mini-dest-header" style="position: relative; width: 100%; display: flex; flex-direction: column; justify-content: center; gap: 0.3rem;">
                
                <!-- Fila 1: DESDE CÁDIZ A y Precio -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="font-size: 0.65rem; color: var(--brand-cyan); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; line-height: 1;">DESDE CÁDIZ A</div>
                    <div class="mini-dest-info-right" style="display: flex; align-items: baseline; justify-content: flex-end; gap: 0.1rem; line-height: 1;">
                        <span class="mini-dest-price" style="line-height: 1;">${dest.price}</span>
                        <span style="font-size: 1.2rem; color: var(--brand-cyan); font-weight: 800; transform: translateY(2px);">*</span>
                    </div>
                </div>

                <!-- Fila 2: Destino y Tiempo -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.4rem; line-height: 1;">
                        <i data-lucide="${dest.icon}" size="16" style="color: var(--brand-cyan);"></i> ${dest.name}
                    </div>
                    ${dest.time ? `<div class="mini-dest-info-right" style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; white-space: nowrap; line-height: 1;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${dest.time}</div>` : ''}
                </div>

                <!-- Icono de cerrar (X) posicionado absolutamente a la derecha -->
                <div class="mini-dest-close-icon" style="display: none; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.05); transition: background 0.3s ease; position: absolute; right: 0; top: 50%; transform: translateY(-50%);">
                    <i data-lucide="x" style="color: white; width: 20px; height: 20px;"></i>
                </div>
            </div>
            <!-- Indicador interactivo inferior animado (latido) posicionado absolutamente para no empujar -->
            <div class="bottom-expand-indicator" style="position: absolute; bottom: 2px; left: 0; width: 100%; height: 0; display: flex; justify-content: center; align-items: flex-end; opacity: 0; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                <div class="chevron-wrapper" style="transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; justify-content: center;">
                    <i data-lucide="chevron-down" style="color: var(--brand-cyan); width: 20px; height: 20px;"></i>
                </div>
            </div>
        </div>
        <div id="detail-${gridType}-${dest.id}" class="dest-detail-container" style="width: 100%;">
            <div class="dest-detail-inner" id="inner-detail-${gridType}-${dest.id}">
                <!-- El contenido dinámico se inyecta aquí -->
            </div>
        </div>
    </div>
    `;
}

window.showDestinoDetails = function(destId, gridType) {
    const dest = dbDestinos[gridType].find(d => d.id === destId);
    if (!dest) return;
    
    const gridId = gridType === 'aeropuertos' ? 'aeropuertos-grid-dinamico' : 'favoritos-grid-dinamico';
    const gridEl = document.getElementById(gridId);
    if (!gridEl) return;
    
    const detailContainerId = `detail-${gridType}-${destId}`;
    const detailEl = document.getElementById(detailContainerId);
    const isCurrentlyOpen = detailEl.classList.contains('is-open');

    const thisCard = document.getElementById(`card-header-${gridType}-${destId}`);
    const thisChevron = thisCard.querySelector('.chevron-wrapper');

    // Si ya está abierta, simplemente la cerramos
    if (isCurrentlyOpen) {
        detailEl.classList.remove('is-open');
        thisCard.classList.remove('card-open');
        if (thisChevron) thisChevron.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            if (!detailEl.classList.contains('is-open')) {
                const inner = detailEl.querySelector('.dest-detail-inner');
                if (inner) inner.style.display = 'none'; // ocultar sin romper layout
            }
        }, 450);
        return;
    }

    // Buscamos si hay alguna OTRA tarjeta abierta
    const openDetails = Array.from(gridEl.querySelectorAll('.dest-detail-container.is-open'));
    
    function openNewCard() {
        // Inyectamos contenido
        const inner = detailEl.querySelector('.dest-detail-inner');
        inner.style.display = ''; // Resetear display por si estaba oculto
        inner.innerHTML = buildSelectedDestinoWidget(dest, gridType);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Rotar chevron
        if (thisChevron) thisChevron.style.transform = 'rotate(180deg)';

        // Forzar reflow y añadir clase para abrir
        void detailEl.offsetWidth;
        detailEl.classList.add('is-open');
        thisCard.classList.add('card-open');

        // Hacer scroll suave hacia la tarjeta tras un pequeñísimo delay para que el layout se calcule
        setTimeout(() => {
            const originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'smooth';
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            
            // Usamos un scroll position ajustado
            const offsetPosition = thisCard.getBoundingClientRect().top + window.scrollY - headerHeight - 75;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
            }, 400);
        }, 50);
    }

    if (openDetails.length > 0) {
        // 1. Cerramos las que estén abiertas
        openDetails.forEach(el => {
            el.classList.remove('is-open');
            // Buscamos su chevron para resetearlo (el wrapper hermano previo)
            const parentCard = el.previousElementSibling;
            if (parentCard) {
                parentCard.classList.remove('card-open');
                const chevron = parentCard.querySelector('.chevron-wrapper');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
            // Limpiamos contenido tras animación
            setTimeout(() => {
                if (!el.classList.contains('is-open')) {
                    const inner = el.querySelector('.dest-detail-inner');
                    if (inner) inner.style.display = 'none'; // ocultar sin romper layout
                }
            }, 450);
        });

        // 2. Esperamos a que termine la animación de cierre (aprox 350ms) antes de abrir la nueva
        setTimeout(() => {
            openNewCard();
        }, 350); 
    } else {
        // No había ninguna abierta, abrimos directamente
        openNewCard();
    }
};

function buildSelectedDestinoWidget(dest, gridType) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">
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
        
        L.control.attribution({ position: 'bottomleft' }).addTo(map);
        
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
                } else if (currentMode === 'todas') {
                    setMode('elegir');
                    const select = document.querySelector('#elegir-select-container select');
                    if (select) {
                        select.value = p.id;
                        select.dispatchEvent(new Event('change'));
                    }
                    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
                    document.documentElement.style.scrollBehavior = 'auto';
                    const mapControls = document.querySelector('.map-controls');
                    if (mapControls) {
                        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                        const offsetPosition = mapControls.getBoundingClientRect().top + window.scrollY - headerHeight - 5;
                        window.scrollTo({ top: offsetPosition, behavior: 'auto' });
                    } else {
                        document.getElementById('map').scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                    requestAnimationFrame(() => {
                        document.documentElement.style.scrollBehavior = originalScrollBehavior;
                    });
                } else if (currentMode === 'elegir') {
                    // Seleccionar parada directamente desde el mapa en modo elegir
                    const select = document.querySelector('#elegir-select-container select');
                    if (select) {
                        select.value = p.id;
                        select.dispatchEvent(new Event('change'));
                    }
                    // Flash visual en el pin para confirmar selección
                    const selectedIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 0 8px rgba(250,204,21,0.8));"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="#facc15" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#111827"></circle></svg></div>`,
                        iconSize: [38, 38],
                        iconAnchor: [19, 38]
                    });
                    marker.setIcon(selectedIcon);
                    setTimeout(() => marker.setIcon(customIcon), 1500);
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
            if (currentMode === 'todas') {
                setMode('elegir');
                const select = document.querySelector('#elegir-select-container select');
                if (select) {
                    select.value = p.id;
                    select.dispatchEvent(new Event('change'));
                }
            } else if (currentMode === 'elegir') {
                const select = document.querySelector('#elegir-select-container select');
                if (select) {
                    select.value = p.id;
                    select.dispatchEvent(new Event('change'));
                }
            } else {
                map.flyTo([p.lat, p.lon], 17);
                markersLayer.eachLayer(layer => {
                    if (layer.getLatLng().lat === p.lat && layer.getLatLng().lng === p.lon) {
                        layer.openPopup();
                    }
                });
            }
            
            const originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'auto';
            
            const mapControls = document.querySelector('.map-controls');
            if (mapControls) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const offsetPosition = mapControls.getBoundingClientRect().top + window.scrollY - headerHeight - 5;
                window.scrollTo({ top: offsetPosition, behavior: 'auto' });
            } else {
                document.getElementById('map').scrollIntoView({ behavior: 'auto', block: 'start' });
            }
            
            requestAnimationFrame(() => {
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
            });

            if (currentMode === 'cercana' && userLocation) {
                fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
            }
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

        item.innerHTML = `
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
        item.addEventListener('click', () => {
            // Pasar a modo 'elegir'
            setMode('elegir');
            
            // Buscar el selector y seleccionar la parada automáticamente
            const select = document.querySelector('#elegir-select-container select');
            if (select) {
                select.value = p.id;
                select.dispatchEvent(new Event('change'));
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
        
        let distHtml = '';
        if (currentMode === 'cercana' && p.distance !== undefined) {
            distHtml = `
                <div id="walk-info-pill" style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid rgba(6, 182, 212, 0.25); width: 100%;">
                    <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;"><i data-lucide="loader-2" style="width:14px; height:14px; animation: spin 1s linear infinite;"></i> Calculando ruta...</div>
                </div>
            `;
        }
        
        overlay.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 9999px; padding: 0.85rem 1.25rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                <div style="display: flex; align-items: center; gap: 0.85rem; width: 100%;">
                    <!-- Icono sin fondo -->
                    <i data-lucide="map-pin" style="color: var(--brand-cyan); width: 28px; height: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); flex-shrink: 0;"></i>
                    <!-- Textos a la derecha -->
                    <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: center;">
                        <span style="color: var(--brand-cyan); font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.15rem;">PARADA DE TAXI</span>
                        <strong style="color: #fff; font-size: 1.1rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${p.name}</strong>
                        <span style="color: rgba(255,255,255,0.7); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.1rem;">${p.address}, Cádiz</span>
                    </div>
                </div>
                ${distHtml}
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        overlay.style.display = 'block';
        // Fade in con traslación suave
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.style.transform = 'translateY(0)';
        });
    };

    const hideMapOverlay = () => {
        const overlay = document.getElementById('map-overlay-info');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'translateY(-20px)';
            setTimeout(() => { overlay.style.display = 'none'; }, 400);
        }
    };

    const buildSelectedStopWidget = (p) => {
        const item = document.createElement('div');
        item.style.cssText = `display: flex; flex-direction: column; width: 100%;`;
        
        // 2. Tarjeta Taxis Oficiales + Alternativas
        const content = `
            </div>\n        ;\n\n    return content;\n}