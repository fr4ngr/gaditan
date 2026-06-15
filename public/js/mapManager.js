// Gestor del Mapa Interactivo (Leaflet + OSRM)
const mapManager = (() => {
    let map = null;
    let markersLayer = null;
    let userMarker = null;
    let routePolyline = null;
    let currentMode = 'todas'; // 'todas' | 'cercana' | 'elegir'
    let userLocation = null; // { lat, lon }
    let selectedParada = null;
    let isNavigating = false;
    let currentRouteSteps = [];
    let currentStepIndex = 0;
    let watchPositionId = null;
    
    // --- Test Mode State ---
    let testMode = false;
    let testMarker = null;
    let watchCallbacks = {};
    let watchCounter = 0;

    const geoService = {
        getCurrentPosition: (success, error, options) => {
            if (testMode && testMarker) {
                const latlng = testMarker.getLatLng();
                success({ coords: { latitude: latlng.lat, longitude: latlng.lng, heading: 0 } });
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error, options);
            } else {
                if (error) error(new Error("Geolocation not supported"));
            }
        },
        watchPosition: (success, error, options) => {
            if (testMode) {
                const id = ++watchCounter;
                watchCallbacks[id] = success;
                if (testMarker) {
                    const latlng = testMarker.getLatLng();
                    success({ coords: { latitude: latlng.lat, longitude: latlng.lng, heading: 0 } });
                }
                return id;
            } else if (navigator.geolocation) {
                return navigator.geolocation.watchPosition(success, error, options);
            }
            return null;
        },
        clearWatch: (id) => {
            if (testMode) {
                delete watchCallbacks[id];
            } else if (navigator.geolocation) {
                navigator.geolocation.clearWatch(id);
            }
        },
        triggerWatch: () => {
            if (testMode && testMarker) {
                const latlng = testMarker.getLatLng();
                Object.values(watchCallbacks).forEach(cb => {
                    cb({ coords: { latitude: latlng.lat, longitude: latlng.lng, heading: 0 } });
                });
            }
        }
    };
    // -----------------------

    let targetDestParada = null;
    let navCurrentRouteLine = null;
    let autoLocateTimeoutId = null;
    let poiLayer = null;
    let poisVisible = false;
    let notifiedPOIs = new Set();
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="position: relative; width: 26px; height: 42px; filter: drop-shadow(0 3px 3px rgba(0,0,0,0.35)); display: flex; flex-direction: column; align-items: center;">
                <div style="background-color: #2563eb; width: 26px; height: 32px; border-radius: 6px; padding: 2.5px; box-sizing: border-box; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; z-index: 2;">
                    <div style="background-color: white; width: 100%; height: 14px; border-radius: 3.5px; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                        <span style="color: black; font-weight: 900; font-size: 7.2px; letter-spacing: 0.4px; line-height: 1; display: block;">TAXI</span>
                    </div>
                </div>
                <div style="width: 2px; height: 10px; background-color: #94a3b8; margin-top: -1px; z-index: 1; box-shadow: 1px 0 2px rgba(0,0,0,0.15);"></div>
            </div>
        `,
        iconSize: [26, 42],
        iconAnchor: [13, 42]
    });

    const userIcon = L.divIcon({
        className: 'user-div-icon',
        html: `
            <div id="user-marker-wrapper" style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease;">
                <div id="user-heading-arrow" style="position: absolute; top: -10px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 12px solid #3b82f6; opacity: 0; transition: opacity 0.3s ease;"></div>
                <div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); position: relative; z-index: 2;"></div>
            </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const poiIcon = L.divIcon({
        className: 'custom-div-icon poi-icon',
        html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ec4899" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#111827"></circle></svg><div style="position: absolute; top: 6px; color: white;"><i data-lucide="camera" style="width: 10px; height: 10px;"></i></div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
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

    const sqr = (x) => x * x;
    const dist2 = (v, w) => sqr(v.lat - w.lat) + sqr(v.lng - w.lng);
    const distToSegmentSquared = (p, v, w) => {
        let l2 = dist2(v, w);
        if (l2 === 0) return dist2(p, v);
        let t = ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2;
        t = Math.max(0, Math.min(1, t));
        return dist2(p, { lat: v.lat + t * (w.lat - v.lat), lng: v.lng + t * (w.lng - v.lng) });
    };
    const pointToLineDist = (pt, line) => {
        if (!line || line.length < 2) return Infinity;
        let minD = Infinity;
        for (let i = 0; i < line.length - 1; i++) {
            let v = { lat: line[i][0], lng: line[i][1] };
            let w = { lat: line[i+1][0], lng: line[i+1][1] };
            let d2 = distToSegmentSquared(pt, v, w);
            if (d2 < minD) minD = d2;
        }
        return Math.sqrt(minD) * 111320;
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
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);
        poiLayer = L.layerGroup().addTo(map);

        // Contenedor de controles horizontales personalizados
        const customControls = document.createElement('div');
        customControls.id = 'map-custom-controls';
        customControls.style.cssText = `
            position: absolute;
            bottom: 1.5rem;
            right: 1rem;
            z-index: 1001;
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
        `;
        document.getElementById('map').appendChild(customControls);
        if (typeof L !== 'undefined') {
            L.DomEvent.disableClickPropagation(customControls);
        }

        // 1. Botón de POIs (Cámara)
        const poiBtn = document.createElement('button');
        poiBtn.title = 'Descubrir comercios y turismo cerca';
        poiBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>
        </svg>`;
        poiBtn.style.cssText = `
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(236, 72, 153, 0.4);
            border-radius: 50%;
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            color: #ec4899;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.2s;
            padding: 0;
        `;
        poiBtn.onmouseover = () => {
            poiBtn.style.background = 'rgba(236, 72, 153, 0.2)';
            poiBtn.style.borderColor = '#ec4899';
        };
        poiBtn.onmouseout = () => {
            if (!poisVisible) {
                poiBtn.style.background = 'rgba(15, 23, 42, 0.85)';
                poiBtn.style.borderColor = 'rgba(236, 72, 153, 0.4)';
            } else {
                poiBtn.style.background = 'rgba(236, 72, 153, 0.3)';
                poiBtn.style.borderColor = '#ec4899';
            }
        };
        poiBtn.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            poisVisible = !poisVisible;
            if (poisVisible) {
                poiBtn.style.background = 'rgba(236, 72, 153, 0.3)';
                poiBtn.style.borderColor = '#ec4899';
                poiBtn.style.boxShadow = '0 0 15px rgba(236, 72, 153, 0.5)';
                renderPOIs();
            } else {
                poiBtn.style.background = 'rgba(15, 23, 42, 0.85)';
                poiBtn.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                poiBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                poiLayer.clearLayers();
            }
        };
        customControls.appendChild(poiBtn);

        // 2. Cápsula de Zoom Horizontal (- +)
        const zoomCapsule = document.createElement('div');
        zoomCapsule.id = 'custom-zoom-capsule';
        zoomCapsule.style.cssText = `
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(6, 182, 212, 0.4);
            border-radius: 20px;
            display: flex;
            flex-direction: row;
            height: 40px;
            overflow: hidden;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            pointer-events: auto;
        `;

        // Botón de Zoom Out (-)
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.title = 'Alejar';
        zoomOutBtn.innerHTML = `<span style="font-size: 1.5rem; line-height: 1; margin-top: -2px;">−</span>`;
        zoomOutBtn.style.cssText = `
            background: transparent;
            border: none;
            border-right: 1px solid rgba(6, 182, 212, 0.25);
            color: #06b6d4;
            width: 40px; height: 40px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-weight: 600;
            transition: all 0.2s;
            padding: 0;
        `;
        zoomOutBtn.onmouseover = () => {
            zoomOutBtn.style.background = 'rgba(6, 182, 212, 0.2)';
        };
        zoomOutBtn.onmouseout = () => {
            zoomOutBtn.style.background = 'transparent';
        };
        zoomOutBtn.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            map.zoomOut();
        };
        zoomCapsule.appendChild(zoomOutBtn);

        // Botón de Zoom In (+)
        const zoomInBtn = document.createElement('button');
        zoomInBtn.title = 'Acercar';
        zoomInBtn.innerHTML = `<span style="font-size: 1.5rem; line-height: 1; margin-top: -2px;">+</span>`;
        zoomInBtn.style.cssText = `
            background: transparent;
            border: none;
            color: #06b6d4;
            width: 40px; height: 40px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-weight: 600;
            transition: all 0.2s;
            padding: 0;
        `;
        zoomInBtn.onmouseover = () => {
            zoomInBtn.style.background = 'rgba(6, 182, 212, 0.2)';
        };
        zoomInBtn.onmouseout = () => {
            zoomInBtn.style.background = 'transparent';
        };
        zoomInBtn.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            map.zoomIn();
        };
        zoomCapsule.appendChild(zoomInBtn);

        customControls.appendChild(zoomCapsule);

        // Control para Modo Prueba (Simulador GPS)
        const TestModeControl = L.Control.extend({
            options: { position: 'topright' },
            onAdd: function() {
                const btn = L.DomUtil.create('button', 'map-test-btn');
                btn.title = 'Activar/Desactivar Simulador GPS';
                btn.innerHTML = `<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">MODO PRUEBA</span>`;
                btn.style.cssText = `
                    background: rgba(245, 158, 11, 0.9);
                    border: 2px solid #d97706;
                    border-radius: 8px;
                    padding: 0.4rem 0.8rem;
                    color: white;
                    cursor: pointer;
                    backdrop-filter: blur(4px);
                    box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4);
                    transition: all 0.2s;
                    margin-top: 10px;
                    margin-right: 10px;
                `;
                L.DomEvent.on(btn, 'click', L.DomEvent.stopPropagation);
                L.DomEvent.on(btn, 'click', () => {
                    testMode = !testMode;
                    if (testMode) {
                        btn.style.background = '#ef4444';
                        btn.style.borderColor = '#b91c1c';
                        btn.innerHTML = `<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">PRUEBA ACTIVA</span>`;
                        
                        map.setView([36.529, -6.292], 16);
                        
                        const testIcon = L.divIcon({
                            className: 'test-user-icon',
                            html: `<div style="background:#ef4444; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div><div style="position:absolute; top:-25px; left:-40px; background:#ef4444; color:white; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold; white-space:nowrap;">Tú (Simulado)</div>`,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        
                        testMarker = L.marker([36.529, -6.292], { icon: testIcon, draggable: true, zIndexOffset: 1000 }).addTo(map);
                        
                        testMarker.on('drag', () => {
                            geoService.triggerWatch();
                        });
                        
                        alert("Modo Prueba Activado. Arrastra el marcador rojo para simular que caminas por Cádiz.");
                        
                    } else {
                        btn.style.background = 'rgba(245, 158, 11, 0.9)';
                        btn.style.borderColor = '#d97706';
                        btn.innerHTML = `<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">MODO PRUEBA</span>`;
                        
                        if (testMarker) {
                            map.removeLayer(testMarker);
                            testMarker = null;
                        }
                        alert("Modo Prueba Desactivado.");
                    }
                });
                return btn;
            }
        });
        new TestModeControl().addTo(map);

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

    const renderPOIs = () => {
        if (!poiLayer || typeof dbPOIs === 'undefined') return;
        poiLayer.clearLayers();
        dbPOIs.forEach(poi => {
            let currentIcon = poiIcon;
            if (poi.image) {
                const isPng = poi.image.toLowerCase().endsWith('.png');
                
                if (isPng) {
                    // Silueta transparente (PNG)
                    currentIcon = L.divIcon({
                        className: 'custom-poi-img-icon-silhouette',
                        html: `
                            <div style="width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5));">
                                <img src="${poi.image}" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
                            </div>
                        `,
                        iconSize: [60, 60],
                        iconAnchor: [30, 60]
                    });
                } else {
                    // Foto en círculo (JPG u otros)
                    currentIcon = L.divIcon({
                        className: 'custom-poi-img-icon',
                        html: `
                            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                                <img src="${poi.image}" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
                            </div>
                        `,
                        iconSize: [44, 44],
                        iconAnchor: [22, 22]
                    });
                }
            }
            const marker = L.marker([poi.lat, poi.lon], { icon: currentIcon }).addTo(poiLayer);
            marker.bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; text-align: center; padding: 0.5rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-weight: 800; color: #0f172a; font-size: 1rem;">${poi.name}</h3>
                    <p style="margin: 0; font-size: 0.8rem; color: #475569;">${poi.description}</p>
                </div>
            `, {
                closeButton: false,
                className: 'poi-popup'
            });
        });
    };

    const renderMarkers = (paradas) => {
        markersLayer.clearLayers();
        const paradasToRender = selectedParada !== null ? [selectedParada] : paradas;
        paradasToRender.forEach(p => {
            const marker = L.marker([p.lat, p.lon], { icon: customIcon }).addTo(markersLayer);
            marker.paradaData = p;
            marker.on('click', () => {
                if (selectedParada === p) {
                    if (routePolyline && !isNavigating) {
                        map.fitBounds(routePolyline.getBounds(), { paddingTopLeft: [20, 200], paddingBottomRight: [20, 20], animate: true });
                    } else {
                        map.flyToBounds([[p.lat, p.lon], [p.lat, p.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });
                    }
                    return;
                }
                
                selectedParada = p;
                if (autoLocateTimeoutId) {
                    clearTimeout(autoLocateTimeoutId);
                    autoLocateTimeoutId = null;
                }
                renderMarkers(dbParadas);

                const tryUpdateDistance = () => {
                    if (p.distance === undefined) p.distance = getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon);
                    fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
                    if (selectedParada === p) renderMapOverlay(p);
                };

                if (userLocation) {
                    tryUpdateDistance();
                } else {
                    map.flyToBounds([[p.lat, p.lon], [p.lat, p.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });
                    renderMapOverlay(p);
                    geoService.getCurrentPosition((pos) => {
                        userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                        tryUpdateDistance();
                    }, () => {}, { timeout: 5000, maximumAge: 60000 });
                }
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
        item.className = 'pildora-hover pildora-parada';
        item.ontouchstart = () => { item.style.transform = 'scale(0.98)'; };
        item.ontouchend   = () => { item.style.transform = 'scale(1)'; };
        item.innerHTML = getListItemHtml(p);


        item.addEventListener('click', () => {
            selectedParada = p;
            if (autoLocateTimeoutId) {
                clearTimeout(autoLocateTimeoutId);
                autoLocateTimeoutId = null;
            }
            renderMarkers(dbParadas);
            
            const tryUpdateDistanceList = () => {
                if (p.distance === undefined) p.distance = getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon);
                fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
                if (selectedParada === p) renderMapOverlay(p);
            };

            if (userLocation) {
                tryUpdateDistanceList();
            } else {
                map.flyToBounds([[p.lat, p.lon], [p.lat, p.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });
                renderMapOverlay(p);
                geoService.getCurrentPosition((pos) => {
                    userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                    tryUpdateDistanceList();
                }, () => {}, { timeout: 5000, maximumAge: 60000 });
            }
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
        item.className = 'pildora-hover pildora-parada';
        item.ontouchstart = () => { item.style.transform = 'scale(0.98)'; };
        item.ontouchend   = () => { item.style.transform = 'scale(1)'; };
        
        let distHtml = '';
        if (p.distance !== undefined) {
            const timeMins = Math.max(1, Math.ceil(p.distance / 0.08));
            distHtml = `<div style="font-size: 0.7rem; color: var(--brand-cyan); font-weight: 600; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.15rem;"><i data-lucide="footprints" style="width:12px; height:12px;"></i> ${formatDistance(p.distance)} &bull; ${timeMins} min a pie</div>`;
        }

        let badgHtml = p.nocturna ? `<span style="background: rgba(239, 68, 68, 0.15); color: #fca5a5; font-size: 0.6rem; font-weight: 800; padding: 0.15rem 0.4rem; border-radius: 4px; margin-left: 0.4rem; border: 1px solid rgba(239, 68, 68, 0.3); vertical-align: middle;">NOCTURNA</span>` : '';

        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.8rem; min-width: 0; flex: 1;">
                <div style="background: var(--brand-cyan); color: #0f172a; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 -2px 4px rgba(0,0,0,0.05);">
                    <i data-lucide="map-pin" style="width:20px; height:20px;"></i>
                </div>
                <div style="display: flex; flex-direction: column; min-width: 0; padding: 0.3rem 0;">
                    <strong style="color: #0f172a; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center;">${p.name}${badgHtml}</strong>
                    <span style="color: var(--text-muted); font-size: 0.72rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.address}</span>
                    ${distHtml}
                </div>
            </div>
            <div class="plus-icon-btn" style="background: rgba(15,23,42,0.05); border: 1px solid rgba(15,23,42,0.1); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-left: 0.5rem; transition: all 0.3s ease;">+</div>
        `;
        item.addEventListener('click', () => {
            selectedParada = p;
            if (autoLocateTimeoutId) {
                clearTimeout(autoLocateTimeoutId);
                autoLocateTimeoutId = null;
            }
            renderMarkers(dbParadas);
            
            if (userLocation) {
                if (p.distance === undefined) p.distance = getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon);
                fetchRoute(userLocation.lat, userLocation.lon, p.lat, p.lon);
            } else {
                map.flyToBounds([[p.lat, p.lon], [p.lat, p.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });
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
        let walkInfoHtml = '';
        if (p.distance !== undefined) {
            const straightDist = p.distance * 1000;
            const walkMins = Math.max(1, Math.round(straightDist / 83.3));
            let timeStr = walkMins + ' min';
            if (walkMins >= 60) {
                const h = Math.floor(walkMins / 60);
                const m = walkMins % 60;
                timeStr = m > 0 ? `${h}h ${m}m` : `${h}h`;
            }
            const distStr = straightDist < 1000 ? Math.round(straightDist) + 'm' : (straightDist / 1000).toFixed(1) + 'km';
            
            let timeHtml = `
                <div style="background-color: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); color: white; font-size: 0.75rem; font-weight: 700; padding: 0 0.75rem; height: 34px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; gap: 0.3rem; white-space: nowrap; flex-shrink: 0;">
                    <i data-lucide="footprints" style="width:14px; height:14px; color: #94a3b8;"></i> ${timeStr}
                </div>`;

            walkInfoHtml = `
                <div style="background-color: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); color: white; font-size: 0.75rem; font-weight: 700; padding: 0 0.75rem; height: 34px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; gap: 0.3rem; white-space: nowrap; flex-shrink: 0;">
                    <i data-lucide="arrow-left-right" style="width:14px; height:14px; color: #94a3b8;"></i> ${distStr}
                </div>${timeHtml}
            `;
        } else {
            walkInfoHtml = `
                <div style="background-color: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); color: white; font-size: 0.75rem; font-weight: 700; padding: 0 0.75rem; height: 34px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; gap: 0.3rem; white-space: nowrap; flex-shrink: 0;">
                    <i data-lucide="arrow-left-right" style="width:14px; height:14px; color: #94a3b8;"></i> <i data-lucide="loader-2" style="width:12px; height:12px; animation: spin 1s linear infinite;"></i>
                </div>
                <div style="background-color: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); color: white; font-size: 0.75rem; font-weight: 700; padding: 0 0.75rem; height: 34px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; gap: 0.3rem; white-space: nowrap; flex-shrink: 0;">
                    <i data-lucide="footprints" style="width:14px; height:14px; color: #94a3b8;"></i> <i data-lucide="loader-2" style="width:12px; height:12px; animation: spin 1s linear infinite;"></i>
                </div>
            `;
        }
        
        if (p.nocturna) {
            banners.push(`
                <div style="background-color: #ef4444; color: white; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 0.5rem 1.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
                    <i data-lucide="moon" style="width: 14px; height: 14px;"></i> PARADA NOCTURNA SÓLO DE 22 A 7H
                </div>
            `);
        }
        
        let topControls = document.getElementById('top-nav-controls');
        if (!topControls) {
            topControls = document.createElement('div');
            topControls.id = 'top-nav-controls';
            topControls.style.cssText = "position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; gap: 0.4rem; align-items: center; justify-content: center; max-width: 95vw;";
            document.getElementById('map').appendChild(topControls);
            if (typeof L !== 'undefined') {
                L.DomEvent.disableClickPropagation(topControls);
            }
        }
        
        topControls.innerHTML = `
            ${walkInfoHtml}
            <button id="btn-start-nav" style="background-color: #0f172a; color: #0ef5e3; font-size: 0.75rem; font-weight: 800; padding: 0 1rem; height: 34px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; transition: transform 0.1s; outline: none; border: none; white-space: nowrap; flex-shrink: 0;">
                <i data-lucide="corner-up-right" style="width:14px; height:14px; color: #0ef5e3;"></i> Cómo llegar
            </button>
        `;
        
        const btnStartNav = document.getElementById('btn-start-nav');
        if (typeof L !== 'undefined') {
            L.DomEvent.on(btnStartNav, 'click', (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                startNavigation(p.lat, p.lon, p.name);
            });
        } else {
            btnStartNav.onclick = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                startNavigation(p.lat, p.lon, p.name);
            };
        }
        topControls.style.display = 'flex';
        
        let bannersHtml = '';
        if (banners.length > 0) {
            bannersHtml = `
                <div id="map-overlay-banners" style="margin: 0.75rem -1.25rem -0.75rem -1.25rem; display: flex; flex-direction: column;">
                    ${banners.join('')}
                </div>
            `;
        }
        
        overlay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
                <!-- Señal TAXI con palo (Traffic Sign Blue with Pole) -->
                <div style="position: relative; width: 40px; height: 60px; display: flex; flex-direction: column; align-items: center; flex-shrink: 0; margin-right: 0.1rem;">
                    <div style="background-color: #2563eb; width: 40px; height: 48px; border-radius: 9px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); box-sizing: border-box; z-index: 2;">
                        <div style="background-color: white; width: 32px; height: 22px; border-radius: 5.5px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: black; font-family: 'Inter', sans-serif; font-weight: 900; font-size: 0.65rem; letter-spacing: 0.6px; line-height: 1;">TAXI</span>
                        </div>
                    </div>
                    <div style="width: 3px; height: 12px; background-color: #94a3b8; margin-top: -1px; z-index: 1; box-shadow: 1px 0 2px rgba(0,0,0,0.15);"></div>
                </div>
                <!-- Textos a la derecha -->
                <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: center;">
                    <span style="color: rgba(15, 23, 42, 0.7); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.1rem;">PARADA DE TAXI</span>
                    <strong style="color: #0f172a; font-size: 1.2rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${p.name}</strong>
                    <span style="color: rgba(15, 23, 42, 0.85); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.1rem;">${p.address}, Cádiz</span>
                </div>
            </div>
            ${bannersHtml}
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        overlay.style.display = 'block';
        requestAnimationFrame(() => {
            overlay.style.padding = '0.75rem 1.25rem';
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
        const topControls = document.getElementById('top-nav-controls');
        if (topControls) topControls.style.display = 'none';
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

    const getManeuverIconValhalla = (type) => {
        if (type === 1 || type === 2 || type === 3) return 'arrow-up';
        if (type === 4 || type === 5 || type === 6) return 'map-pin';
        if (type === 9 || type === 10 || type === 11 || type === 18 || type === 20 || type === 23 || type === 38 || type === 26 || type === 27) return 'corner-up-right';
        if (type === 14 || type === 15 || type === 16 || type === 19 || type === 21 || type === 24 || type === 39) return 'corner-up-left';
        if (type === 12 || type === 13) return 'corner-down-left';
        return 'arrow-up';
    };

    const renderNavStep = () => {
        if (!isNavigating) return;
        let navContainer = document.getElementById('nav-container');
        if (!navContainer) {
            navContainer = document.createElement('div');
            navContainer.id = 'nav-container';
            navContainer.style.cssText = `position: absolute; bottom: 1.5rem; left: 1rem; right: 1rem; background: #0f172a; border-radius: 1rem; z-index: 1000; padding: 1rem; color: white; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); transform: translateY(0); opacity: 1; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;`;
            document.getElementById('map').appendChild(navContainer);
            
            const customControls = document.getElementById('map-custom-controls');
            if (customControls) {
                customControls.style.bottom = '7.5rem';
            }
        }
        
        let contentInner = document.getElementById('nav-content-inner');
        
        if (currentStepIndex >= currentRouteSteps.length) {
            if (!document.getElementById('nav-is-arrived')) {
                navContainer.innerHTML = `
                    <div id="nav-is-arrived" style="display:flex; align-items:flex-start; gap: 1rem; width: 100%;">
                        <div style="background: #10b981; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i data-lucide="map-pin" style="color: white; width: 20px; height: 20px;"></i>
                        </div>
                        <div style="display:flex; flex-direction:column; flex:1;">
                            <strong style="font-size: 1.1rem; line-height: 1.2;">Has llegado</strong>
                            <span style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-top: 0.2rem;">Destino a la vista</span>
                        </div>
                        <button id="btn-stop-nav" style="background: transparent; color: #94a3b8; border: none; padding: 0.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-top: -0.2rem; margin-right: -0.5rem; outline: none;">
                            <i data-lucide="x" style="width: 22px; height: 22px;"></i>
                        </button>
                    </div>
                `;
                document.getElementById('btn-stop-nav').onclick = stopNavigation;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
            return;
        }

        const step = currentRouteSteps[currentStepIndex];
        const instruction = step.instruction || "Sigue recto";
        const icon = getManeuverIconValhalla(step.type);
        const roundedDist = Math.round(step.length * 1000);
        
        if (!contentInner || document.getElementById('nav-is-arrived')) {
            navContainer.innerHTML = `
                <div id="nav-content-inner" style="display:flex; align-items:flex-start; gap: 1rem; width: 100%;">
                    <div id="nav-icon-wrapper" data-current-icon="${icon}" style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i data-lucide="${icon}" style="color: white; width: 20px; height: 20px;"></i>
                    </div>
                    <div style="display:flex; flex-direction:column; flex:1;">
                        <strong id="nav-instruction" style="font-size: 1.1rem; line-height: 1.2;">${instruction}</strong>
                        <span id="nav-distance" style="font-size: 0.85rem; font-weight: 800; color: #38bdf8; margin-top: 0.2rem; display: block;">${roundedDist > 0 ? roundedDist + 'm' : ''}</span>
                    </div>
                    <button id="btn-stop-nav" style="background: transparent; color: #94a3b8; border: none; padding: 0.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-top: -0.2rem; margin-right: -0.5rem; outline: none;">
                        <i data-lucide="x" style="width: 22px; height: 22px;"></i>
                    </button>
                </div>
            `;
            document.getElementById('btn-stop-nav').onclick = stopNavigation;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        const elInst = document.getElementById('nav-instruction');
        if (elInst && elInst.innerText !== instruction) elInst.innerText = instruction;
        
        const elDist = document.getElementById('nav-distance');
        if (elDist) {
            const distTxt = roundedDist > 0 ? roundedDist + 'm' : '';
            if (elDist.innerText !== distTxt) elDist.innerText = distTxt;
        }
        
        const wrapper = document.getElementById('nav-icon-wrapper');
        if (wrapper && wrapper.getAttribute('data-current-icon') !== icon) {
            wrapper.setAttribute('data-current-icon', icon);
            wrapper.innerHTML = `<i data-lucide="${icon}" style="color: white; width: 20px; height: 20px;"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons({ root: wrapper });
        }
    };

    const stopNavigation = () => {
        isNavigating = false;
        currentRouteSteps = [];
        targetDestParada = null;
        if (watchPositionId !== null) {
            geoService.clearWatch(watchPositionId);
            watchPositionId = null;
        }
        const navContainer = document.getElementById('nav-container');
        if (navContainer) {
            navContainer.style.transform = 'translateY(20px)';
            navContainer.style.opacity = '0';
            setTimeout(() => navContainer.remove(), 400);
        }

        const customControls = document.getElementById('map-custom-controls');
        if (customControls) {
            customControls.style.bottom = '1.5rem';
        }
        
        const banners = document.getElementById('map-overlay-banners');
        if (banners) banners.style.display = 'flex';
        
        if (selectedParada) {
            renderMapOverlay(selectedParada);
            map.flyToBounds([[selectedParada.lat, selectedParada.lon], [selectedParada.lat, selectedParada.lon]], { maxZoom: 17, paddingTopLeft: [0, 200] });
        }
    };

    const showPOINotification = (poi, distance) => {
        let container = document.getElementById('poi-notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'poi-notification-container';
            container.style.cssText = `position: absolute; top: 5rem; left: 50%; transform: translateX(-50%) translateY(-20px); z-index: 1100; width: 90%; max-width: 400px; display: flex; flex-direction: column; gap: 0.5rem; opacity: 0; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease; pointer-events: none;`;
            document.getElementById('map').appendChild(container);
        }

        const notificationId = 'poi-notif-' + Date.now();
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.style.cssText = `background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(236, 72, 153, 0.4); border-radius: 1rem; padding: 0.8rem 1rem; color: white; display: flex; align-items: center; gap: 0.8rem; box-shadow: 0 10px 25px rgba(236, 72, 153, 0.2); pointer-events: auto;`;
        
        notification.innerHTML = `
            <div style="background: rgba(236, 72, 153, 0.2); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #ec4899;">
                <i data-lucide="camera" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="display:flex; flex-direction:column; flex:1;">
                <span style="font-size: 0.7rem; font-weight: 800; color: #ec4899; text-transform: uppercase; letter-spacing: 0.5px;">En tu ruta (A ${Math.round(distance)}m)</span>
                <strong style="font-size: 0.95rem; line-height: 1.2; margin-top: 0.1rem;">${poi.name}</strong>
            </div>
            <button onclick="document.getElementById('${notificationId}').remove()" style="background: transparent; border: none; color: #94a3b8; padding: 0.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="x" style="width: 18px; height: 18px;"></i>
            </button>
        `;
        
        container.appendChild(notification);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        requestAnimationFrame(() => {
            container.style.transform = 'translateX(-50%) translateY(0)';
            container.style.opacity = '1';
        });

        // Auto-hide after 8 seconds
        setTimeout(() => {
            const el = document.getElementById(notificationId);
            if (el) el.remove();
        }, 8000);
    };

    const startNavigation = (lat, lon, name) => {
        isNavigating = true;
        notifiedPOIs.clear();
        targetDestParada = { lat, lon, name };
        const banners = document.getElementById('map-overlay-banners');
        if (banners) banners.style.display = 'none';
        
        const topControls = document.getElementById('top-nav-controls');
        if (topControls) topControls.style.display = 'none';
        
        const navContainer = document.createElement('div');
        navContainer.id = 'nav-container';
        navContainer.style.cssText = `position: absolute; bottom: 1.5rem; left: 1rem; right: 1rem; background: #0f172a; border-radius: 1rem; z-index: 1000; padding: 1rem; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); transform: translateY(20px); opacity: 0; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;`;
        navContainer.innerHTML = `<i data-lucide="loader-2" style="animation: spin 1s linear infinite; margin-right: 0.5rem;"></i> Calculando ruta...`;
        document.getElementById('map').appendChild(navContainer);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        const customControls = document.getElementById('map-custom-controls');
        if (customControls) {
            customControls.style.bottom = '7.5rem';
        }

        requestAnimationFrame(() => {
            navContainer.style.transform = 'translateY(0)';
            navContainer.style.opacity = '1';
        });

        watchPositionId = geoService.watchPosition(
            (pos) => {
                const uLat = pos.coords.latitude;
                const uLon = pos.coords.longitude;
                const heading = pos.coords.heading;
                
                if (!userMarker) {
                    userMarker = L.marker([uLat, uLon], { icon: userIcon }).addTo(map);
                } else {
                    userMarker.setLatLng([uLat, uLon]);
                }
                
                if (userMarker) {
                    const el = userMarker.getElement();
                    if (el) {
                        const wrapper = el.querySelector('#user-marker-wrapper');
                        const arrow = el.querySelector('#user-heading-arrow');
                        if (wrapper && arrow) {
                            if (heading !== null && !isNaN(heading)) {
                                wrapper.style.transform = `rotate(${heading}deg)`;
                                arrow.style.opacity = '1';
                            } else {
                                arrow.style.opacity = '0';
                            }
                        }
                    }
                }
                
                map.fitBounds([[uLat, uLon], [uLat, uLon]], { maxZoom: 18, paddingBottomRight: [0, 150], animate: true });
                
                // --- Motor de Geofencing ---
                if (typeof dbPOIs !== 'undefined') {
                    dbPOIs.forEach(poi => {
                        const distToPoi = getDistance(uLat, uLon, poi.lat, poi.lon) * 1000;
                        if (distToPoi <= poi.radius && !notifiedPOIs.has(poi.id)) {
                            notifiedPOIs.add(poi.id);
                            showPOINotification(poi, distToPoi);
                        }
                    });
                }
                // ---------------------------
                
                if (currentRouteSteps.length === 0) {
                    fetchRoute(uLat, uLon, targetDestParada.lat, targetDestParada.lon);
                } else {
                    const distToDest = getDistance(uLat, uLon, targetDestParada.lat, targetDestParada.lon) * 1000;
                    if (distToDest < 20) {
                        currentStepIndex = currentRouteSteps.length;
                        renderNavStep();
                        return;
                    }

                    if (navCurrentRouteLine) {
                        const devDist = pointToLineDist({lat: uLat, lng: uLon}, navCurrentRouteLine);
                        if (devDist > 30) {
                            currentRouteSteps = []; 
                            navContainer.innerHTML = `<i data-lucide="refresh-cw" style="animation: spin 1s linear infinite; margin-right: 0.5rem;"></i> Recalculando...`;
                            if (typeof lucide !== 'undefined') lucide.createIcons();
                            fetchRoute(uLat, uLon, targetDestParada.lat, targetDestParada.lon);
                            return;
                        }
                    }

                    if (currentStepIndex < currentRouteSteps.length - 1) {
                        const nextStep = currentRouteSteps[currentStepIndex + 1];
                        if (nextStep) {
                            const nextStepCoord = navCurrentRouteLine[nextStep.begin_shape_index];
                            if (nextStepCoord) {
                                const stepLat = nextStepCoord[0];
                                const stepLon = nextStepCoord[1];
                                const distToNextStep = getDistance(uLat, uLon, stepLat, stepLon) * 1000;
                                if (distToNextStep < 15) {
                                    currentStepIndex++;
                                    renderNavStep();
                                } else {
                                    currentRouteSteps[currentStepIndex].length = distToNextStep / 1000;
                                    renderNavStep();
                                }
                            }
                        }
                    } else {
                         currentRouteSteps[currentStepIndex].length = distToDest / 1000;
                         renderNavStep();
                    }
                }
            },
            (err) => {
                console.error("Error GPS nav:", err);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const decodePolyline = (str, precision) => {
        let index = 0,
            lat = 0,
            lng = 0,
            coordinates = [],
            shift = 0,
            result = 0,
            byte = null,
            latitude_change,
            longitude_change,
            factor = Math.pow(10, precision || 5);

        while (index < str.length) {
            byte = null;
            shift = 0;
            result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            shift = 0;
            result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            lat += latitude_change;
            lng += longitude_change;

            coordinates.push([lat / factor, lng / factor]);
        }

        return coordinates;
    };

    const fetchRoute = async (lat1, lon1, lat2, lon2) => {
        try {
            const json = {
                locations: [
                    { lat: lat1, lon: lon1 },
                    { lat: lat2, lon: lon2 }
                ],
                costing: "pedestrian",
                language: "es-ES",
                units: "kilometers"
            };
            const url = `https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(json))}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.trip || !data.trip.legs || data.trip.legs.length === 0) return;
            
            const leg = data.trip.legs[0];
            const coordinates = decodePolyline(leg.shape, 6);
            
            if (isNavigating) {
                currentRouteSteps = leg.maneuvers;
                currentStepIndex = 0;
                navCurrentRouteLine = coordinates;
                renderNavStep();
            }

            clearRoute();
            
            routePolyline = L.polyline(coordinates, {
                color: '#3b82f6',
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10',
                lineJoin: 'round'
            }).addTo(map);
            
            if (!isNavigating) {
                map.fitBounds(routePolyline.getBounds(), {
                    paddingTopLeft: [20, 200],
                    paddingBottomRight: [20, 20],
                    animate: true
                });
            }
            
            const pill = document.getElementById('walk-info-pill');
            if (pill && !isNavigating) {
                const walkDist = data.trip.summary.length * 1000;
                const walkSecs = data.trip.summary.time;
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

    const updateVisibleParadas = () => {
        if (currentMode !== 'todas' || !map || selectedParada !== null) return;
        // El modo 'Todas' muestra siempre todas las paradas.
        // Se evita filtrar por bounds para que la lista no desaparezca al hacer zoom.
        renderPaginatedList(dbParadas);
    };

    const setMode = (mode) => {
        currentMode = mode;
        const btnTodas = document.getElementById('btn-todas');
        const btnCercana = document.getElementById('btn-cercana');
        
        clearRoute();
        
        if (autoLocateTimeoutId) {
            clearTimeout(autoLocateTimeoutId);
            autoLocateTimeoutId = null;
        }
        
        if(btnTodas) btnTodas.classList.remove('active');
        if(btnCercana) btnCercana.classList.remove('active');
        
        if (mode === 'todas') {
            selectedParada = null;
            if(btnTodas) btnTodas.classList.add('active');
            
            hideMapOverlay();
            
            renderMarkers(dbParadas);
            currentPage = 1;
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
            
            // Eliminamos la actualización por bounds para que la lista 'Todas' siempre esté disponible
            map.off('moveend', updateVisibleParadas);

            autoLocateTimeoutId = setTimeout(() => {
                geoService.getCurrentPosition((position) => {
                    if (currentMode === 'todas' && selectedParada === null && map) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        userLocation = { lat, lon };
                        if (userMarker) map.removeLayer(userMarker);
                        userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
                        userMarker.bindPopup("Tu ubicación actual");
                        map.flyTo([lat, lon], 16, { animate: true, duration: 1.5 });
                    }
                }, (err) => {
                    console.log("Auto-location failed:", err);
                }, { timeout: 6000, maximumAge: 60000 });
            }, 2000);

        } else if (mode === 'cercana') {
            if(btnCercana) btnCercana.classList.add('active');
            
            // Remove the moveend listener for list updating when not in 'todas' mode
            map.off('moveend', updateVisibleParadas);
            
            setTimeout(() => { if (map) map.invalidateSize(); }, 400);
            
            geoService.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                userLocation = { lat, lon };
                
                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
                userMarker.bindPopup("Tu ubicación actual");

                const paradasConDistancia = dbParadas.map(p => {
                    return { ...p, distance: getDistance(lat, lon, p.lat, p.lon) };
                }).sort((a, b) => a.distance - b.distance);
                
                const top5 = paradasConDistancia.slice(0, 5);
                
                Promise.all(top5.map(async (p) => {
                    try {
                        const json = {
                            locations: [
                                { lat: lat, lon: lon },
                                { lat: p.lat, lon: p.lon }
                            ],
                            costing: "pedestrian",
                            units: "kilometers"
                        };
                        const url = `https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(json))}`;
                        const response = await fetch(url);
                        const data = await response.json();
                        if (data.trip && data.trip.summary) {
                            return { ...p, realDistance: data.trip.summary.length * 1000 };
                        }
                        return { ...p, realDistance: Infinity };
                    } catch (e) {
                        return { ...p, realDistance: Infinity };
                    }
                })).then(resultados => {
                    resultados.sort((a, b) => a.realDistance - b.realDistance);
                    const masCercana = resultados[0];
                    
                    selectedParada = masCercana;
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
                });

            }, (error) => {
                console.error("Error geolocating:", error);
                alert("No hemos podido acceder a tu ubicación. Comprueba los permisos de tu navegador.");
                setMode('todas');
            }, { timeout: 10000 });
        }
    };

    return { init, startNav: startNavigation };
})();

document.addEventListener('DOMContentLoaded', () => {
    mapManager.init();
});

