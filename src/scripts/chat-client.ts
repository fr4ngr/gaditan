
import { renderCardDOM } from '../components/cards/CardRenderer';

    // --- DATOS DE PARADAS GLOBALES ---
    const CADIZ_STOPS = [
        { name: "Parador", desc: "Parador de Cádiz", lat: 36.5342075, lon: -6.3050849 },
        { name: "Falla", desc: "Plaza de Falla", lat: 36.5334696, lon: -6.3021514 },
        { name: "Mora", desc: "Glorieta Carlos Con", lat: 36.531308, lon: -6.305134 },
        { name: "San Antonio", desc: "Plaza de San Antonio", lat: 36.534150, lon: -6.297400 },
        { name: "Palillero", desc: "Plaza del Palillero", lat: 36.5318437, lon: -6.2964062 },
        { name: "Plaza Tortugas", desc: "Plaza de las Tortugas", lat: 36.533451, lon: -6.293564 },
        { name: "La Punta", desc: "Paseo Almirante Pascual Pery (Solo noches)", lat: 36.537434, lon: -6.290726 },
        { name: "Comes", desc: "Plaza de la Hispanidad", lat: 36.535364, lon: -6.291775 },
        { name: "Catedral", desc: "Plaza de la Catedral", lat: 36.529217, lon: -6.295707 },
        { name: "San Juan de Dios", desc: "Plaza de San Juan de Dios", lat: 36.530537, lon: -6.291444 },
        { name: "Estación", desc: "Entrada Oeste de la Estación de Adif", lat: 36.528159, lon: -6.287746 },
        { name: "Caja Nacional", desc: "Junto al INSS", lat: 36.526253, lon: -6.289851 },
        { name: "Monte Puerta Tierra", desc: "Avenida Andalucía, 34", lat: 36.520385, lon: -6.285054 },
        { name: "Pabellón", desc: "Calle Brunete", lat: 36.520156, lon: -6.282787 },
        { name: "Corte Inglés", desc: "Avenida de las Cortes de Cádiz", lat: 36.521661, lon: -6.276634 },
        { name: "Bar Parada", desc: "Avenida Guadalquivir, 23", lat: 36.519283, lon: -6.277154 },
        { name: "Hotel Barceló", desc: "Avenida Andalucía, 89", lat: 36.514442, lon: -6.281504 },
        { name: "Camelia", desc: "Avenida Ana de Viya, 7", lat: 36.511658, lon: -6.279901 },
        { name: "Barriada", desc: "Avenida Guadalete", lat: 36.511384, lon: -6.271984 },
        { name: "Residencia", desc: "Avenida Cayetano del Toro, 1 (Hospital Puerta del Mar)", lat: 36.507906, lon: -6.277750 },
        { name: "Mercadona", desc: "Avenida de la Ilustración, 1", lat: 36.507279, lon: -6.268245 },
        { name: "Canary", desc: "Glorieta Zona Franca", lat: 36.505821, lon: -6.276564 },
        { name: "Helios", desc: "Plaza Helios (Estadio)", lat: 36.501347, lon: -6.274249 },
        { name: "Piscina", desc: "Complejo Deportivo Ciudad de Cádiz", lat: 36.497418, lon: -6.271457 },
        { name: "Zona Franca", desc: "Glorieta de la Zona Franca", lat: 36.500538, lon: -6.268548 }
    ];

    const AIRPORTS = [
        { name: "Aeropuerto de Sevilla (SVQ)", desc: "", lat: 37.423518, lon: -5.900192, approxTime: "1h 15m", approxDist: "130km" },
        { name: "Aeropuerto de Jerez (XRY)", desc: "", lat: 36.750488, lon: -6.064420, approxTime: "35m", approxDist: "43km" },
        { name: "Aeropuerto de Málaga (AGP)", desc: "", lat: 36.677706, lon: -4.491414, approxTime: "2h 20m", approxDist: "225km" },
        { name: "Aeropuerto de Gibraltar (GIB)", desc: "", lat: 36.153944, lon: -5.347113, approxTime: "1h 20m", approxDist: "118km" }
    ];

    // --- ESTADO DEL CHAT ---
    const messagesContainer = document.getElementById('messages-container');
    const inputField = document.querySelector('.chat-input') as HTMLInputElement;
    const sendButton = document.querySelector('.send-button');
    let chatHistory: any[] = [];

    // --- RENDERIZADO BÁSICO ---
    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function addMessage(sender: 'user' | 'bot', content: string | HTMLElement, shouldScroll: boolean = true) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentWrapper = document.createElement('div');
        contentWrapper.style.display = 'contents';
        if (typeof content === 'string') {
            contentWrapper.innerHTML = content;
        } else {
            contentWrapper.appendChild(content);
        }
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';
        metaDiv.innerHTML = `<span class="message-time">${time}</span>`;
        
        messageDiv.appendChild(contentWrapper);
        messageDiv.appendChild(metaDiv);
        
        if (sender === 'bot') {
            const rawContent = typeof content === 'string' ? encodeURIComponent(content) : encodeURIComponent(contentWrapper.innerHTML);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'msg-actions-row';
            actionsDiv.style.display = 'flex';
            actionsDiv.style.justifyContent = 'flex-end';
            actionsDiv.style.gap = '8px';
            actionsDiv.style.marginTop = '4px';
            actionsDiv.style.marginBottom = '8px';
            actionsDiv.style.marginRight = '8px';
            
            actionsDiv.innerHTML = `
                <button class="action-btn thumb-up" onclick="window.toggleThumb(this)" aria-label="Me gusta" style="background: transparent; color: var(--text-secondary); border: none; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.2s, transform 0.1s;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                </button>
                <button class="action-btn thumb-down" onclick="window.toggleThumb(this)" aria-label="No me gusta" style="background: transparent; color: var(--text-secondary); border: none; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.2s, transform 0.1s;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"></path></svg>
                </button>
                <button class="action-btn save-msg-btn" onclick="window.saveMessage(this, '${rawContent}')" aria-label="Guardar" style="background: transparent; color: var(--text-secondary); border: none; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.2s, transform 0.1s;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
                </button>
                <button class="action-btn share-btn" onclick="window.shareMessage('${rawContent}')" aria-label="Compartir" style="background: transparent; color: var(--text-secondary); border: none; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.2s, transform 0.1s;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
            `;
            
            // Insertar la fila de acciones antes de las píldoras (suggested-blocks-container) o al final
            const suggestedBlocks = messageDiv.querySelector('.suggested-blocks-container');
            const metaBlock = messageDiv.querySelector('.message-meta');
            
            if (suggestedBlocks && suggestedBlocks.parentNode) {
                suggestedBlocks.parentNode.insertBefore(actionsDiv, suggestedBlocks);
            } else if (metaBlock && metaBlock.parentNode) {
                metaBlock.parentNode.insertBefore(actionsDiv, metaBlock);
            } else {
                messageDiv.appendChild(actionsDiv);
            }
        }
        
        messagesContainer?.appendChild(messageDiv);
        if (shouldScroll) {
            scrollToBottom();
        }
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = 'message bot';
        wrapper.id = id;
        wrapper.innerHTML = `
            <div class="bubble typing-indicator" style="padding: 0; display: flex; align-items: center; justify-content: center; width: 64px; height: 40px; overflow: hidden;">
                <div id="lottie-${id}" style="width: 100%; height: 100%; transform: scale(1.8);"></div>
            </div>
        `;
        document.getElementById('messages-container')?.appendChild(wrapper);
        scrollToBottom();
        
        // Iniciar animación Lottie
        if ((window as any).lottie) {
            (window as any).lottie.loadAnimation({
                container: document.getElementById(`lottie-${id}`),
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: '/lottie/loading-ball.json'
            });
        }
        
        return id;
    }

    function removeTypingIndicator(id: string) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // --- GENERATIVE UI ENGINE (TARJETAS) ---
    function renderCard(data: any, msgId: string): HTMLElement {
        return renderCardDOM(data, msgId);
    }

    window.escapeHTML = function(str: string) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // --- CONEXIÓN CON EL CEREBRO DE IA ---
    async function sendMessageToAI(text: string, isHiddenInit: boolean = false, inputType: string = 'typed') {
        if (!text.trim()) return;
        
        if (!isHiddenInit) {
            addMessage('user', `<span class="bubble">${window.escapeHTML(text)}</span>`);
        }
        chatHistory.push({ role: 'user', parts: [{ text }] });
        
        if (!isHiddenInit) {
            inputField.value = '';
        }

        const typingId = showTypingIndicator();

        let sessionId = localStorage.getItem('cadiz_chat_session');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cadiz_chat_session', sessionId);
        }

        let userProfile = localStorage.getItem('gaditan_profile') || 'desconocido';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: chatHistory, inputType: isHiddenInit ? 'system' : inputType, sessionId, userProfile })
            });

            const data = await response.json();
            removeTypingIndicator(typingId);

            if (data.error) {
                let errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                if (errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('demasiada gente')) {
                    errorMsg = "Servidores de Inteligencia Artificial saturados temporalmente. Por favor, inténtalo de nuevo en unos segundos.";
                }
                
                const safeText = text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                addMessage('bot', `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <span class="bubble" style="background:#ffebee; color:#c62828;">⚠️ ${errorMsg}</span>
                        <button class="call-btn" style="background: #c62828; margin: 0; align-self: flex-start; padding: 6px 12px; font-size: 0.85rem;" onclick="window.sendToAI('${safeText}', ${isHiddenInit})">🔄 Reintentar</button>
                    </div>
                `);
                
                chatHistory.pop();
                return;
            }

            chatHistory.push({ role: 'model', parts: [{ text: JSON.stringify(data) }] });

            const msgId = Date.now().toString();
            const cardEl = renderCardDOM(data, msgId);
            
            addMessage('bot', cardEl);

            if (data.cardType === 'NavigationCard' && data.lat && data.lon) {
                setTimeout(() => {
                    window.startLiveNavigation(data.lat, data.lon, data.stopName || 'Destino');
                }, 800);
            }

        } catch (error: any) {
            console.error('CHAT ERROR:', error);
            removeTypingIndicator(typingId);
            addMessage('bot', `<span class="bubble" style="background:#ffebee; color:#c62828;">Error interno: ${error?.message || error}. Inténtalo de nuevo.</span>`);
        }
    }

    // --- LÓGICA DE NAVEGACIÓN Y CABECERA ESTÁTICA ---
    document.addEventListener("DOMContentLoaded", () => {
        const swiper = document.getElementById('main-swiper');
        if (swiper) {
            swiper.style.scrollBehavior = 'auto';
            swiper.scrollLeft = swiper.clientWidth;
            setTimeout(() => { swiper.style.scrollBehavior = 'smooth'; }, 50);

            let mapLoadedOnSwipe = false;
            swiper.addEventListener('scroll', () => {
                if (!mapLoadedOnSwipe && swiper.scrollLeft > swiper.clientWidth * 1.5) {
                    mapLoadedOnSwipe = true;
                    if (!(window as any).currentMap) {
                        if (typeof window.openFullscreenMap === 'function') {
                            window.openFullscreenMap(null, null, 'swipe');
                        }
                    }
                }
            });
        }
    });

    window.switchPanel = function(panelId: 'guardados' | 'chat' | 'mapa') {
        const swiper = document.getElementById('main-swiper');
        if (!swiper) return;

        let leftPos = 0;
        
        if (panelId === 'guardados') {
            leftPos = 0;
        } else if (panelId === 'chat') {
            leftPos = swiper.clientWidth;
        } else if (panelId === 'mapa') {
            if (window.switchTab) window.switchTab('mapa');
            return;
        }
        
        swiper.scrollTo({ left: leftPos, behavior: 'instant' });
    };

    window.initializeGlobalMap = function() {
        const container = document.getElementById('fullscreen-widget-area');
        if (!container) return;

        container.innerHTML = `<div id="fullscreen-leaflet-global" style="width: 100%; height: 100%;"></div>`;

        setTimeout(() => {
            const mapL = (window as any).L;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            const map = mapL.map(`fullscreen-leaflet-global`, { 
                zoomControl: false, 
                dragging: !isMobile,
                tap: !isMobile
            });
            
            mapL.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
            map.setView([36.516, -6.283], 13);
            
            window.currentMap = map;
            
            if (isMobile) {
                map.dragging.enable();
                map.tap.enable();
            }
            
            if (window.renderMapMarkers) window.renderMapMarkers();
        }, 100);
    };

    window.openFullscreenMap = function(lat: string | null, lon: string | null, msgId: string) {
        window.switchPanel('mapa');
        if (window.closeMapInfoPill) window.closeMapInfoPill();
        
        const topPills = document.getElementById('map-top-pills');
        if (topPills) topPills.style.display = 'none';

        const container = document.getElementById('fullscreen-widget-area');
        if (!container) return;

        container.innerHTML = `<div id="fullscreen-leaflet-${msgId}" style="width: 100%; height: 100%;"></div>`;

        setTimeout(() => {
            const mapL = (window as any).L;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            const map = mapL.map(`fullscreen-leaflet-${msgId}`, { 
                zoomControl: false, 
                dragging: !isMobile,
                tap: !isMobile
            });
            
            if (isMobile) {
                map.on('touchstart', (e: any) => {
                    if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length === 1) {
                        let overlay = document.getElementById('map-touch-warning');
                        if (!overlay) {
                            overlay = document.createElement('div');
                            overlay.id = 'map-touch-warning';
                            overlay.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.7); color:white; padding:12px 20px; border-radius:20px; font-weight:600; z-index:9999; pointer-events:none; opacity:0; transition:opacity 0.3s; text-align:center; font-size:14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
                            overlay.innerText = 'Usa dos dedos para mover el mapa';
                            document.getElementById(`fullscreen-leaflet-${msgId}`)?.appendChild(overlay);
                        }
                        overlay.style.opacity = '1';
                        if ((window as any)._touchWarningTimeout) clearTimeout((window as any)._touchWarningTimeout);
                        (window as any)._touchWarningTimeout = setTimeout(() => { overlay.style.opacity = '0'; }, 1500);
                    }
                });
            }

            window.currentMap = map; 
            
            const devControl = mapL.control({ position: 'bottomright' });
            devControl.onAdd = function() {
                const btn = mapL.DomUtil.create('button', 'leaflet-bar leaflet-control');
                btn.innerHTML = '📍 Dev';
                btn.style.backgroundColor = 'var(--primary-color)';
                btn.style.color = 'white';
                btn.style.fontWeight = 'bold';
                btn.style.border = 'none';
                btn.style.padding = '8px 12px';
                btn.style.cursor = 'pointer';
                btn.style.marginBottom = '10px';
                btn.style.borderRadius = '8px';
                btn.style.fontSize = '12px';
                btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                
                btn.onclick = function(e: any) {
                    mapL.DomEvent.stopPropagation(e);
                    if (window.isDevModeLocation) {
                        window.isDevModeLocation = false;
                        btn.innerHTML = '📍 Dev';
                        btn.style.backgroundColor = 'var(--primary-color)';
                        map.getContainer().style.cursor = '';
                        map.off('click', window.devMapClickListener);
                    } else {
                        window.isDevModeLocation = true;
                        btn.innerHTML = 'Haz clic en el mapa...';
                        btn.style.backgroundColor = '#f59e0b';
                        map.getContainer().style.cursor = 'crosshair';
                        
                        window.devMapClickListener = function(ev: any) {
                            window.devMockLat = ev.latlng.lat;
                            window.devMockLon = ev.latlng.lng;
                            
                            window.isDevModeLocation = false;
                            btn.innerHTML = '📍 Fake Loc ✔';
                            btn.style.backgroundColor = '#10b981';
                            map.getContainer().style.cursor = '';
                            map.off('click', window.devMapClickListener);
                            
                            if (window.activeMapStopLat) {
                                window.mapActionDirections();
                            }
                        };
                        map.on('click', window.devMapClickListener);
                    }
                };
                return btn;
            };
            devControl.addTo(map);

            mapL.control.zoom({ position: 'bottomright' }).addTo(map);
            
            map.createPane('labels');
            map.getPane('labels').style.zIndex = 500;
            map.getPane('labels').style.pointerEvents = 'none';
            
            mapL.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB', subdomains: 'abcd', maxZoom: 20
            }).addTo(map);

            mapL.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
                subdomains: 'abcd', maxZoom: 20,
                pane: 'labels'
            }).addTo(map);



            window.doNearestPOI = function(userLat: number, userLon: number, poiType: 'stop' | 'airport' = 'stop') {
                const loadingHtml = `
                <div class="message bot" id="loading-nearest">
                    <div class="message-content">
                        <span class="bubble">Calculando tu ${poiType === 'airport' ? 'aeropuerto' : 'parada'} más cercan${poiType === 'airport' ? 'o' : 'a'}... 📍</span>
                    </div>
                </div>`;
                const chatOutput = document.getElementById('chat-output');
                if (chatOutput) chatOutput.insertAdjacentHTML('beforeend', loadingHtml);
                
                document.body.style.cursor = 'wait';

                if (userLat > 37 || userLat < 36 || userLon > -6 || userLon < -7) {
                    userLat = 36.529217;
                    userLon = -6.295707;
                }

                setTimeout(() => {
                    const loadingMsg = document.getElementById('loading-nearest');
                    if (loadingMsg) loadingMsg.remove();
                    
                    const map = window.currentMap;
                    const mapL = (window as any).L;
                    map.invalidateSize();
                    
                    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                        const R = 6371e3;
                        const dLat = (lat2 - lat1) * Math.PI/180;
                        const dLon = (lon2 - lon1) * Math.PI/180;
                        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                  Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
                                  Math.sin(dLon/2) * Math.sin(dLon/2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        return R * c;
                    };
                    
                    const POI_LIST = poiType === 'airport' ? AIRPORTS : CADIZ_STOPS;
                    
                    const paradasConDist = POI_LIST.map(p => ({
                        ...p,
                        distance: getDistance(userLat, userLon, parseFloat(p.lat as unknown as string), parseFloat(p.lon as unknown as string))
                    })).sort((a,b) => a.distance - b.distance);
                    
                    const top5 = paradasConDist.slice(0, 5);
                    
                    const routeProfile = poiType === 'airport' ? 'routed-car/route/v1/driving' : 'routed-foot/route/v1/foot';
                    Promise.all(top5.map(async (p) => {
                        try {
                            const url = `https://routing.openstreetmap.de/${routeProfile}/${userLon},${userLat};${p.lon},${p.lat}?overview=false`;
                            const response = await fetch(url);
                            const data = await response.json();
                            if (data.routes && data.routes[0]) {
                                return { ...p, realDistance: data.routes[0].distance, duration: data.routes[0].duration };
                            }
                            return { ...p, realDistance: Infinity, duration: 0 };
                        } catch (e) {
                            return { ...p, realDistance: Infinity, duration: 0 };
                        }
                    })).then(resultados => {
                        document.body.style.cursor = 'default';
                        resultados.sort((a, b) => a.realDistance - b.realDistance);
                        const masCercana = resultados[0];
                        
                        let distText = '';
                        if (masCercana.realDistance !== Infinity) {
                            if (masCercana.realDistance > 1000) {
                                distText = `a ${(masCercana.realDistance / 1000).toFixed(1)} km`;
                            } else {
                                distText = `a ${Math.round(masCercana.realDistance)} metros`;
                            }
                        }
                        const timeText = masCercana.duration ? `(${Math.ceil(masCercana.duration / 60)} min ${poiType === 'airport' ? 'en coche' : 'a pie'})` : '';
                        
                        window.sendToAI(`He seleccionado la ubicación: ${masCercana.name}. Dame información sobre este lugar o guíame.`);
                        
                        map.setView([masCercana.lat, masCercana.lon], poiType === 'airport' ? 10 : 16);
                        const targetIcon = mapL.divIcon({
                            html: '<div style="background:var(--primary-color); border: 2px solid white; width:16px; height:16px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>',
                            className: '', iconSize: [16, 16], iconAnchor: [8, 8]
                        });
                        const marker = mapL.marker([masCercana.lat, masCercana.lon], {icon: targetIcon}).addTo(map);
                        marker.on('click', () => {
                            window.openMapInfoPill(masCercana.name, masCercana.desc, masCercana.lat, masCercana.lon, poiType);
                            window.mapActionDirections(poiType);
                        });
                        window.openMapInfoPill(masCercana.name, masCercana.desc, masCercana.lat, masCercana.lon, poiType);
                        
                        setTimeout(() => {
                            window.mapActionDirections(poiType);
                        }, 500);
                    });
                }, 10);
            };

            window.doAllAirportsWithRoutes = function(userLat: number, userLon: number) {
                document.body.style.cursor = 'wait';
                if (userLat > 37 || userLat < 36 || userLon > -6 || userLon < -7) {
                    userLat = 36.529217;
                    userLon = -6.295707;
                }

                setTimeout(() => {
                    const map = window.currentMap;
                    const mapL = (window as any).L;
                    map.invalidateSize();
                    
                    const bounds = mapL.latLngBounds([userLat, userLon]);
                    AIRPORTS.forEach(p => bounds.extend([p.lat, p.lon]));
                    map.fitBounds(bounds, { padding: [20, 20] });
                    window.globalAirportsBounds = bounds;
                    
                    const userIcon = mapL.divIcon({
                        html: '<div style="background:#4285F4; border: 2px solid white; width:16px; height:16px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>',
                        className: '', iconSize: [16, 16], iconAnchor: [8, 8]
                    });
                    mapL.marker([userLat, userLon], {icon: userIcon, zIndexOffset: 1000}).addTo(map);

                    const targetIcon = mapL.divIcon({
                        html: '<div style="background:var(--primary-color); border: 2px solid white; width:16px; height:16px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>',
                        className: '', iconSize: [16, 16], iconAnchor: [8, 8]
                    });

                    const markersLayer = mapL.layerGroup().addTo(map);
                    window.currentMarkersLayer = markersLayer;

                    const topPillsContainer = document.getElementById('map-top-pills');
                    if (topPillsContainer) {
                        topPillsContainer.innerHTML = '';
                        topPillsContainer.style.display = 'flex';
                    }

                    const airportSvgIcon = mapL.divIcon({
                        html: `
                        <div style="background:var(--primary-color); border: 2px solid white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20" style="transform: rotate(45deg);">
                                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                            </svg>
                        </div>`,
                        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
                    });

                    AIRPORTS.forEach(res => {
                        const cityName = res.name.replace("Aeropuerto de ", "").replace("Aeroporto do ", "").replace(/\s*\(.*?\)\s*/g, "");

                        const marker = mapL.marker([res.lat, res.lon], {icon: airportSvgIcon}).addTo(markersLayer);
                        
                        const selectAirport = async () => {
                            if (topPillsContainer) topPillsContainer.style.display = 'none';
                            
                            window.openMapInfoPill(res.name, res.desc, res.lat, res.lon, 'airport');
                            const routeBounds = mapL.latLngBounds([userLat, userLon], [res.lat, res.lon]);
                            map.fitBounds(routeBounds, { paddingTopLeft: [50, 250], paddingBottomRight: [50, 50] });
                            map.removeLayer(markersLayer);
                            
                            if (window.currentActiveMarker) map.removeLayer(window.currentActiveMarker);
                            window.currentActiveMarker = mapL.marker([res.lat, res.lon], {icon: airportSvgIcon}).addTo(map);

                            if (window.currentAirportRouteLayer) map.removeLayer(window.currentAirportRouteLayer);
                            window.currentAirportRouteLayer = mapL.layerGroup().addTo(map);

                            document.body.style.cursor = 'wait';
                            try {
                                const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${userLon},${userLat};${res.lon},${res.lat}?overview=full&geometries=geojson`;
                                const response = await fetch(url);
                                const data = await response.json();
                                if (data.routes && data.routes[0]) {
                                    const routeData = data.routes[0];
                                    const coordinates = routeData.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
                                    
                                    const polyline = mapL.polyline(coordinates, {
                                        color: 'white', weight: 6, opacity: 0.8
                                    }).addTo(window.currentAirportRouteLayer);
                                    
                                    map.fitBounds(polyline.getBounds(), { paddingTopLeft: [50, 250], paddingBottomRight: [50, 50] });
                                    
                                    mapL.polyline(coordinates, {
                                        color: '#4285F4', weight: 4, opacity: 0.8,
                                        dashArray: '10, 10', className: 'animated-route'
                                    }).addTo(window.currentAirportRouteLayer);

                                    const durationMin = Math.ceil(routeData.duration / 60);
                                    const distanceKm = (routeData.distance / 1000).toFixed(1);
                                    const h = Math.floor(durationMin / 60);
                                    const m = durationMin % 60;
                                    const durationText = h > 0 ? `${h}h ${m}m` : `${m}m`;
                                    const distanceText = `${distanceKm}km`;

                                    const statsEl = document.getElementById('map-floating-route-stats');
                                    const timeEl = document.getElementById('route-time');
                                    const distEl = document.getElementById('route-distance');
                                    if (statsEl && timeEl && distEl) {
                                        statsEl.style.display = 'flex';
                                        timeEl.innerText = durationText;
                                        distEl.innerText = distanceText;
                                    }
                                }
                            } catch (e) {
                                console.error('Error fetching route', e);
                            }
                            document.body.style.cursor = 'default';
                        };

                        marker.on('click', selectAirport);
                        
                        if (topPillsContainer) {
                            const btn = document.createElement('button');
                            const miniSvg = `
                            <div style="background:var(--primary-color); width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16" style="transform: rotate(45deg);">
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                </svg>
                            </div>`;
                            btn.innerHTML = `${miniSvg}${cityName}`;
                            btn.style.cssText = 'display: flex; align-items: center; background: var(--header-bg); border: 1px solid var(--header-border); border-radius: 20px; padding: 6px 16px 6px 6px; font-size: 14px; font-weight: 600; color: var(--text-primary); cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-shrink: 0; transition: transform 0.2s;';
                            btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
                            btn.onmouseup = () => btn.style.transform = 'scale(1)';
                            btn.onmouseleave = () => btn.style.transform = 'scale(1)';
                            btn.onclick = selectAirport;
                            topPillsContainer.appendChild(btn);
                        }
                    });
                    document.body.style.cursor = 'default';
                }, 10);
            };

            window.doAllAirportsFallback = function() {
                const map = window.currentMap;
                const mapL = (window as any).L;
                map.setView([36.516, -6.0], 10);
                const targetIcon = mapL.divIcon({
                    html: '<div style="background:var(--primary-color); border: 2px solid white; width:16px; height:16px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>',
                    className: '', iconSize: [16, 16], iconAnchor: [8, 8]
                });
                const markersLayer = mapL.layerGroup().addTo(map);
                window.currentMarkersLayer = markersLayer;
                AIRPORTS.forEach(stop => {
                    const marker = mapL.marker([stop.lat, stop.lon], {icon: targetIcon}).addTo(markersLayer);
                    marker.on('click', () => {
                        window.openMapInfoPill(stop.name, stop.desc, stop.lat, stop.lon, 'airport');
                        map.setView([stop.lat, stop.lon], 14);
                        map.removeLayer(markersLayer);
                        if (window.currentActiveMarker) map.removeLayer(window.currentActiveMarker);
                        window.currentActiveMarker = mapL.marker([stop.lat, stop.lon], {icon: targetIcon}).addTo(map);
                    });
                });
            };

            if (lat === 'NEAREST' || lat === 'NEAREST_AIRPORT' || lat === 'ALL_AIRPORTS') {
                const isNearestAirport = lat === 'NEAREST_AIRPORT';
                const isAllAirports = lat === 'ALL_AIRPORTS';
                const poiType = (isNearestAirport || isAllAirports) ? 'airport' : 'stop';

                const onLocationSuccess = (uLat: number, uLon: number) => {
                    if (isAllAirports) {
                        window.doAllAirportsWithRoutes(uLat, uLon);
                    } else {
                        window.doNearestPOI(uLat, uLon, poiType);
                    }
                };

                const onLocationError = () => {
                    document.body.style.cursor = 'default';
                    alert("No se pudo obtener la ubicación. Mostrando mapa general.");
                    if (isAllAirports) {
                        window.doAllAirportsFallback();
                    } else {
                        window.openFullscreenMap(poiType === 'airport' ? 'ALL_AIRPORTS' : null, null, msgId);
                    }
                };

                if (window.devMockLat && window.devMockLon) {
                    onLocationSuccess(window.devMockLat, window.devMockLon);
                } else if (navigator.geolocation) {
                    const needHighAccuracy = (lat !== 'ALL_AIRPORTS');
                    navigator.geolocation.getCurrentPosition((position) => {
                        onLocationSuccess(position.coords.latitude, position.coords.longitude);
                    }, onLocationError, { enableHighAccuracy: needHighAccuracy, timeout: 10000, maximumAge: 300000 });
                } else {
                    onLocationError();
                }
            } else if (!lat) {
                map.setView([36.516, -6.283], 13);
                
                const targetIcon = mapL.divIcon({
                    html: '<div style="background:var(--primary-color); border: 2px solid white; width:16px; height:16px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>',
                    className: '', iconSize: [16, 16], iconAnchor: [8, 8]
                });
                
                const markersLayer = mapL.layerGroup().addTo(map);
                window.currentMarkersLayer = markersLayer;

                CADIZ_STOPS.forEach(stop => {
                    const marker = mapL.marker([stop.lat, stop.lon], {icon: targetIcon});
                    marker.addTo(markersLayer);
                    
                    marker.on('click', () => {
                        window.openMapInfoPill(stop.name, stop.desc, stop.lat, stop.lon, 'stop');
                        
                        map.setView([stop.lat, stop.lon], 16);
                        map.removeLayer(markersLayer); 
                        if (window.postsLayer) map.removeLayer(window.postsLayer);
                        
                        if (window.currentActiveMarker) map.removeLayer(window.currentActiveMarker);
                        window.currentActiveMarker = mapL.marker([stop.lat, stop.lon], {icon: targetIcon}).addTo(map);
                    });
                });
                
                // Cargar publicaciones sociales
                if (window.renderMapMarkers) window.renderMapMarkers();
            } else if (lat && lon) {
                map.setView([lat, lon], 16);
                const marker = mapL.marker([lat, lon]).addTo(map);
                marker.on('click', () => {
                    window.openMapInfoPill("Destino Seleccionado", "Coordenadas exactas", lat, lon);
                });
                window.openMapInfoPill("Destino Seleccionado", "Coordenadas exactas", lat, lon);
            }
            
            setTimeout(() => map.invalidateSize(), 300);
        }, 100);
    };

    window.closeMapInfoPill = function() {
        if (window.cancelMapRoute) window.cancelMapRoute();
        const uiContainer = document.getElementById('map-ui-container');
        const mapCloseBtn = document.getElementById('map-close-btn');
        const floatingStats = document.getElementById('map-floating-route-stats');
        
        if (uiContainer) {
            uiContainer.style.opacity = '0';
            uiContainer.style.transform = 'translateX(-50%) translateY(-10px)';
            uiContainer.style.pointerEvents = 'none';
            const pill = document.getElementById('map-info-pill');
            if (pill) pill.style.pointerEvents = 'none';
        }
        if (floatingStats) {
            floatingStats.style.display = 'none';
        }
        if (mapCloseBtn) {
            mapCloseBtn.style.opacity = '1';
            mapCloseBtn.style.pointerEvents = 'auto';
            mapCloseBtn.style.transform = 'scale(1)';
        }
        
        if (window.currentMap && window.currentMarkersLayer) {
            const isAirportMode = window.activePoiType === 'airport';
            if (isAirportMode && window.globalAirportsBounds) {
                window.currentMap.fitBounds(window.globalAirportsBounds, { padding: [20, 20] });
                const topPills = document.getElementById('map-top-pills');
                if (topPills) topPills.style.display = 'flex';
            } else {
                window.currentMap.setView([36.516, -6.283], 13);
            }
            if (window.currentActiveMarker) window.currentMap.removeLayer(window.currentActiveMarker);
            if (window.currentAirportRouteLayer) window.currentMap.removeLayer(window.currentAirportRouteLayer);
            window.currentMap.addLayer(window.currentMarkersLayer);
            if (window.postsLayer) window.currentMap.addLayer(window.postsLayer);
        }
    };

    window.openMapInfoPill = function(title: string, desc: string, lat: string | number, lon: string | number, type: 'stop' | 'airport' | 'post' = 'stop', extraData?: any) {
        const mapL = (window as any).L;
        window.activeMapStopLat = parseFloat(lat as string);
        window.activeMapStopLon = parseFloat(lon as string);
        window.activeMapStopName = title;
        window.activePoiType = type;

        const uiContainer = document.getElementById('map-ui-container');
        const mapCloseBtn = document.getElementById('map-close-btn');
        if (uiContainer) {
            const titleEl = document.getElementById('map-info-title');
            const descEl = document.getElementById('map-info-desc');
            const labelEl = document.getElementById('map-stop-label');
            if (titleEl) titleEl.innerText = title;
            if (descEl) {
                if (type === 'airport') {
                    descEl.style.display = 'none';
                } else {
                    descEl.style.display = 'block';
                    descEl.innerHTML = desc ? desc.replace(/\n/g, '<br/>') : '';
                    if (extraData && extraData.audio_url) {
                        descEl.innerHTML += `<div style="margin-top: 12px;"><audio controls src="${extraData.audio_url}" style="width: 100%; height: 36px; outline: none;"></audio></div>`;
                    }
                }
            }
            if (labelEl) {
                if (type === 'airport') labelEl.innerText = 'DESTINO:';
                else if (type === 'post') labelEl.innerText = 'PUBLICACIÓN LOCAL';
                else labelEl.innerText = 'PARADA DE TAXI';
            }
            
            const actions = document.getElementById('map-pill-actions');
            const floatingStats = document.getElementById('map-floating-route-stats');
            const instEl = document.getElementById('route-instruction');
            
            const btnDirections = document.getElementById('pill-btn-directions');
            const btnReserve = document.getElementById('pill-btn-reserve');
            
            if (actions) actions.style.display = 'flex';
            if (floatingStats) floatingStats.style.display = 'none';
            if (instEl) instEl.style.display = 'none';

            if (btnDirections && btnReserve) {
                if (type === 'airport') {
                    btnDirections.style.display = 'none';
                    btnReserve.style.display = 'flex';
                } else {
                    btnDirections.style.display = 'flex';
                    btnReserve.style.display = 'none';
                }
            }
            
            uiContainer.style.opacity = '1';
            uiContainer.style.transform = 'translateX(-50%) translateY(0)';
            uiContainer.style.pointerEvents = 'auto';
            const pill = document.getElementById('map-info-pill');
            if (pill) pill.style.pointerEvents = 'auto';
        }
        if (mapCloseBtn) {
            mapCloseBtn.style.opacity = '0';
            mapCloseBtn.style.pointerEvents = 'none';
            mapCloseBtn.style.transform = 'scale(0.8)';
        }
    };

    window.renderMapMarkers = async function() {
        if (!window.currentMap) return;
        const map = window.currentMap;
        const mapL = (window as any).L;
        
        try {
            const res = await fetch('/api/posts/list?limit=50');
            if (!res.ok) return;
            const data = await res.json();
            
            if (window.postsLayer) map.removeLayer(window.postsLayer);
            window.postsLayer = mapL.layerGroup().addTo(map);

            const postIcon = mapL.divIcon({
                html: '<div style="background:#e91e63; border: 2px solid white; width:22px; height:22px; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;"><span style="color:white; font-size:12px;">💬</span></div>',
                className: '', iconSize: [22, 22], iconAnchor: [11, 11]
            });

            data.posts.forEach((post: any) => {
                if (post.lat && post.lon) {
                    const marker = mapL.marker([post.lat, post.lon], {icon: postIcon});
                    marker.addTo(window.postsLayer);
                    marker.on('click', () => {
                        window.openMapInfoPill(post.user_name || 'Alguien', post.content || 'Sin texto', post.lat, post.lon, 'post', { audio_url: post.audio_url });
                        map.setView([post.lat, post.lon], 16);
                        if (window.currentMarkersLayer) map.removeLayer(window.currentMarkersLayer);
                        if (window.postsLayer) map.removeLayer(window.postsLayer);
                        
                        if (window.currentActiveMarker) map.removeLayer(window.currentActiveMarker);
                        window.currentActiveMarker = mapL.marker([post.lat, post.lon], {icon: postIcon}).addTo(map);
                    });
                }
            });
        } catch(e) { console.error("Error cargando posts en mapa:", e); }
    };

    window.mapActionDirections = function(forceType?: 'stop' | 'airport') {
        if (!window.activeMapStopLat || !window.activeMapStopLon || !window.currentMap) return;
        const type = forceType || window.activePoiType || 'stop';

        if (navigator.geolocation || window.devMockLat) {
            const actions = document.getElementById('map-pill-actions');
            const floatingStats = document.getElementById('map-floating-route-stats');
            const routeTime = document.getElementById('route-time');
            const routeDistance = document.getElementById('route-distance');
            const labelEl = document.getElementById('map-stop-label');
            const instEl = document.getElementById('route-instruction');

            if (actions) actions.style.display = 'none';
            if (floatingStats) floatingStats.style.display = 'flex';
            if (instEl) instEl.style.display = 'flex';
            if (routeTime) routeTime.innerText = "Calculando...";
            if (routeDistance) routeDistance.innerText = "-- m";
            if (labelEl) labelEl.innerText = type === 'airport' ? 'DESTINO:' : 'DESTINO: PARADA DE TAXI';

            const handlePosition = async (userLat: number, userLon: number) => {
                const stopLat = window.activeMapStopLat;
                const stopLon = window.activeMapStopLon;
                const mapL = (window as any).L;

                if (!window.currentUserMarker) {
                    const userIcon = mapL.divIcon({
                        className: 'custom-user-marker',
                        html: '<div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3);"></div>',
                        iconSize: [18, 18],
                        iconAnchor: [9, 9]
                    });

                    window.currentUserMarker = mapL.marker([userLat, userLon], {
                        icon: userIcon,
                        draggable: !!window.devMockLat
                    }).addTo(window.currentMap);

                    if (window.devMockLat) {
                        window.currentUserMarker.on('dragstart', () => {
                            window.isDraggingDevMarker = true;
                        });

                        window.currentUserMarker.on('drag', function(event: any) {
                            if (!window.currentRoutePolylineBase) return;
                            const latlngs = window.currentRoutePolylineBase.getLatLngs();
                            if (!latlngs || latlngs.length < 2) return;
                            
                            const currentPoint = window.currentMap.latLngToLayerPoint(event.latlng);
                            let minDistance = Infinity;
                            let closestP = null;

                            for (let i = 0; i < latlngs.length - 1; i++) {
                                const p1 = window.currentMap.latLngToLayerPoint(latlngs[i]);
                                const p2 = window.currentMap.latLngToLayerPoint(latlngs[i+1]);
                                
                                let x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
                                const dot = dx * dx + dy * dy;
                                if (dot > 0) {
                                    const t = ((currentPoint.x - x) * dx + (currentPoint.y - y) * dy) / dot;
                                    if (t > 1) { x = p2.x; y = p2.y; }
                                    else if (t > 0) { x += dx * t; y += dy * t; }
                                }
                                const projectedPoint = mapL.point(x, y);
                                const distance = currentPoint.distanceTo(projectedPoint);
                                if (distance < minDistance) {
                                    minDistance = distance;
                                    closestP = window.currentMap.layerPointToLatLng(projectedPoint);
                                }
                            }
                            
                            if (closestP) {
                                event.target.setLatLng(closestP);
                                window.devMockLat = closestP.lat;
                                window.devMockLon = closestP.lng;
                                
                                if (window.devDragThrottle) return;
                                window.devDragThrottle = setTimeout(() => {
                                    window.devDragThrottle = null;
                                    if (window.activeMapStopLat) window.mapActionDirections();
                                }, 400);
                            }
                        });

                        window.currentUserMarker.on('dragend', function(event: any) {
                            window.isDraggingDevMarker = false;
                            const position = event.target.getLatLng();
                            window.devMockLat = position.lat;
                            window.devMockLon = position.lng;
                            if (window.activeMapStopLat) window.mapActionDirections();
                        });
                    }
                } else {
                    if (!window.devMockLat || !window.isDraggingDevMarker) {
                        window.currentUserMarker.setLatLng([userLat, userLon]);
                    }
                }

                try {
                    const profile = type === 'airport' ? 'routed-car/route/v1/driving' : 'routed-foot/route/v1/foot';
                    const response = await fetch(`https://routing.openstreetmap.de/${profile}/${userLon},${userLat};${stopLon},${stopLat}?overview=full&geometries=geojson&steps=true`);
                    const data = await response.json();

                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const distanceMeters = route.distance;
                        const durationSeconds = route.duration;
                        const minutes = Math.ceil(durationSeconds / 60);
                        
                        const routeInstructionText = document.getElementById('route-instruction-text');
                        if (routeTime) routeTime.innerText = `${minutes} min`;
                        if (routeDistance) {
                            if (distanceMeters > 1000) {
                                routeDistance.innerText = `${(distanceMeters / 1000).toFixed(1)} km`;
                            } else {
                                routeDistance.innerText = `${Math.round(distanceMeters)} m`;
                            }
                        }

                        const actionElem = document.getElementById('route-instruction-action');
                        const streetElem = document.getElementById('route-instruction-street');

                        if (actionElem && streetElem && route.legs && route.legs[0] && route.legs[0].steps) {
                            const steps = route.legs[0].steps;
                            const firstStep = steps[0];
                            
                            if (firstStep) {
                                const dist = Math.round(firstStep.distance);
                                const nextStep = steps[1];

                                let actionStr = `Avanza ${dist} m`;
                                let streetStr = (firstStep.name && firstStep.name.trim() !== '') ? `por ${firstStep.name}` : "por esta vía";

                                if (nextStep) {
                                    const nextType = nextStep.maneuver.type;
                                    const nextModifier = nextStep.maneuver.modifier || '';
                                    const nextName = (nextStep.name && nextStep.name.trim() !== '') ? nextStep.name : 'la vía';

                                    if (nextType === 'turn' || nextType === 'new name' || nextType === 'roundabout' || nextType === 'fork') {
                                        let action = 'Gira';
                                        if (nextModifier.includes('left')) action = 'Gira a la izq.';
                                        else if (nextModifier.includes('right')) action = 'Gira a la der.';
                                        else if (nextModifier === 'straight') action = 'Sigue recto';

                                        if (dist > 15) {
                                            actionStr = `En ${dist} m, ${action.toLowerCase()}`;
                                            streetStr = `por ${nextName}`;
                                        } else {
                                            actionStr = `${action}`;
                                            streetStr = `por ${nextName}`;
                                        }
                                    } else if (nextType === 'arrive') {
                                        if (dist > 15) {
                                            actionStr = `En ${dist} m llegarás`;
                                            streetStr = `a tu destino`;
                                        } else {
                                            actionStr = `Has llegado`;
                                            streetStr = `a tu destino`;
                                        }
                                    }
                                } else {
                                    if (firstStep.maneuver.type === 'arrive' || dist <= 15) {
                                        actionStr = `Has llegado`;
                                        streetStr = `a tu destino`;
                                    }
                                }

                                actionElem.innerText = actionStr;
                                streetElem.innerText = streetStr;
                            } else {
                                actionElem.innerText = "Sigue la ruta";
                                streetElem.innerText = `hacia ${window.activeMapStopName}`;
                            }
                        }

                        const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
                        
                        if (!window.currentRoutePolylineBase) {
                            window.currentRoutePolylineBase = mapL.polyline(coordinates, {
                                color: '#ffffff',
                                weight: 6,
                                opacity: 1,
                                lineJoin: 'round'
                            }).addTo(window.currentMap);

                            window.currentRoutePolyline = mapL.polyline(coordinates, {
                                color: 'var(--primary-color)',
                                weight: 6,
                                opacity: 1,
                                dashArray: '10, 10',
                                lineJoin: 'round',
                                className: 'animated-route'
                            }).addTo(window.currentMap);
                        } else {
                            window.currentRoutePolylineBase.setLatLngs(coordinates);
                            window.currentRoutePolyline.setLatLngs(coordinates);
                        }

                        if (!window.isDraggingDevMarker) {
                            const bounds = mapL.latLngBounds([
                                [userLat, userLon],
                                [stopLat, stopLon]
                            ]);
                            window.currentMap.fitBounds(bounds, {
                                paddingTopLeft: [20, 200],
                                paddingBottomRight: [20, 20]
                            });
                        }

                    } else {
                        if (routeTime) routeTime.innerText = "Error";
                        if (routeDistance) routeDistance.innerText = "Error";
                    }
                } catch (e) {
                    console.error(e);
                    if (routeTime) routeTime.innerText = "Error red";
                }
            };

            if (window.devMockLat && window.devMockLon) {
                handlePosition(window.devMockLat, window.devMockLon);
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => handlePosition(position.coords.latitude, position.coords.longitude),
                    (error) => {
                        console.error("Error GPS", error);
                        alert("No hemos podido acceder a tu ubicación. Comprueba que tienes el GPS activado y le has dado permisos al navegador.");
                        window.cancelMapRoute();
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            }
        } else {
            alert("Tu navegador no soporta geolocalización.");
        }
    };

    window.cancelMapRoute = function() {
        if (window.currentRoutePolyline && window.currentMap) {
            window.currentMap.removeLayer(window.currentRoutePolyline);
            window.currentRoutePolyline = null;
        }
        if (window.currentRoutePolylineBase && window.currentMap) {
            window.currentMap.removeLayer(window.currentRoutePolylineBase);
            window.currentRoutePolylineBase = null;
        }
        if (window.currentUserMarker && window.currentMap) {
            window.currentMap.removeLayer(window.currentUserMarker);
            window.currentUserMarker = null;
        }

        const actions = document.getElementById('map-pill-actions');
        const routeInfo = document.getElementById('map-pill-route-info');
        if (actions) actions.style.display = 'flex';
        if (routeInfo) routeInfo.style.display = 'none';

        if (window.activeMapStopLat && window.activeMapStopLon && window.currentMap) {
            window.currentMap.setView([window.activeMapStopLat, window.activeMapStopLon], 16);
        }
    };

    window.mapActionReserve = function() {
        const title = window.activeMapStopName || 'el aeropuerto';
        window.closeMapInfoPill();
        
        if (typeof addMessage === 'function') {
            addMessage('user', `<span class="bubble">Quiero reservar un taxi para: ${window.escapeHTML(title)}</span>`);
            const chatOutput = document.getElementById('chat-output');
            if (chatOutput) {
                const reserveData = {
                    cardType: 'ReservationCard',
                    content: `¡Perfecto! Te preparo el acceso rápido para solicitar una reserva hacia <strong>${title}</strong>.`
                };
                const cardEl = renderCardDOM(reserveData, 'reserve-' + Date.now());
                const msg = document.createElement('div');
                msg.className = 'message bot';
                msg.appendChild(cardEl);
                chatOutput.appendChild(msg);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            }
        }
    };

    window.mapActionTaxi = function() {
        if (window.activeMapStopName) {
            window.switchPanel('chat');
            if (typeof addMessage === 'function') {
                addMessage('user', `<span class="bubble">Quiero pedir un taxi desde la parada: ${window.escapeHTML(window.activeMapStopName)}</span>`);
                
                const contentText = "¡Claro! Para pedir un taxi ahora en Cádiz, debes ponerte en contacto directamente con la emisora oficial autorizada por el Ayuntamiento. Puedes llamarles por teléfono o pedir el taxi por whatsapp.";
                
                const contactHtml = `
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%; max-width: 100%; align-self: flex-start; margin-bottom: 0.5rem;">
                        <span class="bubble" style="border-bottom-left-radius: 4px;">${contentText}</span>
                        <div class="info-card contact-card">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-weight: 600; color: #333;">RadioTaxi Cádiz</span>
                                <div style="display: flex; gap: 8px;">
                                    <a href="tel:956212121" class="call-btn" style="text-decoration: none; width: auto; padding: 8px 12px; margin: 0; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> <span class="btn-text">Llamar</span></a>
                                    <a href="https://wa.me/34956212121" class="wa-btn" target="_blank" rel="noopener noreferrer" style="background: #25D366; color: white; border-radius: 8px; font-weight: 600; text-decoration: none; width: auto; padding: 8px 12px; margin: 0; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg> <span class="btn-text">WhatsApp</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                addMessage('bot', contactHtml);
            }
        }
    };

    window.shareMessage = async function(encodedHtml: string) {
        const html = decodeURIComponent(encodedHtml);
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const text = temp.innerText.trim();
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Info de Cádiz Plus',
                    text: text,
                    url: window.location.href
                });
            } catch (err) {
                console.error('Error al compartir:', err);
            }
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('¡Información copiada al portapapeles!');
            });
        }
    };

    window.toggleThumb = function(btn: HTMLElement) {
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            btn.style.color = 'var(--text-secondary)';
            btn.style.fill = 'none';
        } else {
            btn.classList.add('active');
            btn.style.color = 'var(--primary-color)';
            btn.style.fill = 'var(--primary-color)';
            
            const parent = btn.parentElement;
            if (parent) {
                if (btn.classList.contains('thumb-up')) {
                    const down = parent.querySelector('.thumb-down') as HTMLElement;
                    if (down && down.classList.contains('active')) window.toggleThumb(down);
                } else if (btn.classList.contains('thumb-down')) {
                    const up = parent.querySelector('.thumb-up') as HTMLElement;
                    if (up && up.classList.contains('active')) window.toggleThumb(up);
                }
            }
        }
    };

    window.saveMessage = async function(btn: HTMLElement, encodedHtml: string) {
        const html = decodeURIComponent(encodedHtml);
        
        try {
            const resMe = await fetch('/api/auth/me');
            const dataMe = await resMe.json();
            const isLoggedIn = !!dataMe.user;

            let savedLocal = JSON.parse(localStorage.getItem('cadiz_saved_messages') || '[]');
            const isSavedLocally = savedLocal.indexOf(html) > -1;
            
            const willBeSaved = !isSavedLocally;

            if (willBeSaved) {
                if (isLoggedIn) {
                    await fetch('/api/bookmarks/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: html })
                    });
                }
                savedLocal.push(html);
                btn.classList.add('saved');
                btn.style.fill = '#ef4444';
                btn.style.color = '#ef4444';
            } else {
                if (isLoggedIn) {
                    await fetch('/api/bookmarks/remove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: html })
                    });
                }
                const index = savedLocal.indexOf(html);
                if (index > -1) savedLocal.splice(index, 1);
                btn.classList.remove('saved');
                btn.style.fill = 'none';
                btn.style.color = 'var(--text-secondary)';
            }
            
            localStorage.setItem('cadiz_saved_messages', JSON.stringify(savedLocal));
            window.renderSavedMessages();
            if (window.updateBookmarksBadge) window.updateBookmarksBadge();

            if (willBeSaved && !isLoggedIn && window.openLoginModal) {
                setTimeout(() => {
                    if (confirm("¡Mensaje guardado localmente!\n\n¿Quieres iniciar sesión para guardar tus favoritos en la nube de forma permanente y no perderlos si cambias de móvil?")) {
                        window.openLoginModal();
                    }
                }, 400);
            }

        } catch (e) {
            console.error('Error saving bookmark', e);
        }
    };

    window.updateBookmarksBadge = async function() {
        try {
            const resMe = await fetch('/api/auth/me');
            const dataMe = await resMe.json();
            (window as any).dataMe = dataMe;
            
            if (dataMe.error) {
                alert(dataMe.error);
                localStorage.removeItem('cadiz_saved_messages');
            }

            let saved = [];
            
            if (dataMe.user) {
                const resList = await fetch('/api/bookmarks/list');
                saved = await resList.json();
                localStorage.setItem('cadiz_saved_messages', JSON.stringify(saved));
            } else {
                saved = JSON.parse(localStorage.getItem('cadiz_saved_messages') || '[]');
            }

            const badge = document.getElementById('bookmarks-badge');
            const icon = document.getElementById('bookmark-icon');
            if (badge && icon) {
                if (saved.length > 0) {
                    badge.style.display = 'flex';
                    badge.innerText = saved.length.toString();
                    icon.style.fill = '#ef4444';
                    icon.style.stroke = '#ef4444';
                } else {
                    badge.style.display = 'none';
                    icon.style.fill = 'none';
                    icon.style.stroke = 'currentColor';
                }
            }
            
            if (window.updateProfileUI) {
                window.updateProfileUI(dataMe);
            }
        } catch (e) {
            console.error('Error updating badge', e);
        }
    };
    let onboardingDebounce = null;
    window.checkUsername = async function(value) {
        const username = value.trim().toLowerCase();
        const statusDiv = document.getElementById('username-status');
        const submitBtn = document.getElementById('onboarding-submit-btn');
        
        if (!/^[a-z0-9_]+$/.test(username)) {
            statusDiv.innerText = 'Solo letras minúsculas, números y guión bajo.';
            statusDiv.style.color = '#ef4444';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
            return;
        }

        if (username.length < 3) {
            statusDiv.innerText = 'Debe tener al menos 3 caracteres.';
            statusDiv.style.color = '#ef4444';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
            return;
        }

        statusDiv.innerText = 'Comprobando...';
        statusDiv.style.color = 'var(--text-secondary)';

        if (onboardingDebounce) clearTimeout(onboardingDebounce);
        onboardingDebounce = setTimeout(async () => {
            try {
                const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
                const data = await res.json();
                
                if (data.available) {
                    statusDiv.innerText = '✅ ¡Nombre de usuario disponible!';
                    statusDiv.style.color = '#10b981';
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                } else {
                    statusDiv.innerText = '❌ Este usuario ya está en uso.';
                    statusDiv.style.color = '#ef4444';
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.5';
                    submitBtn.style.cursor = 'not-allowed';
                }
            } catch (e) {
                statusDiv.innerText = 'Error al comprobar.';
                statusDiv.style.color = '#ef4444';
            }
        }, 500);
    };

    window.submitOnboarding = async function() {
        const name = document.getElementById('onboarding-name').value.trim();
        const username = document.getElementById('onboarding-username').value.trim().toLowerCase();
        const submitBtn = document.getElementById('onboarding-submit-btn');
        
        if (!name || !username) return;
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Guardando...';

        try {
            const res = await fetch('/api/users/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username })
            });

            if (res.ok) {
                document.getElementById('onboarding-modal').style.display = 'none';
                if (window.updateBookmarksBadge) window.updateBookmarksBadge();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar el perfil.');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Completar Perfil';
            }
        } catch (e) {
            alert('Error de conexión.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Completar Perfil';
        }
    };

    window.updateProfileUI = async function(dataMe) {
        const profileAvatarEmoji = document.getElementById('profile-page-avatar-emoji');
        const profileAvatarImg = document.getElementById('profile-page-avatar-img');
        const profileName = document.getElementById('profile-page-name');
        const profileDesc = document.getElementById('profile-page-desc');
        const profileBio = document.getElementById('profile-page-bio');
        const profileAuthBtn = document.getElementById('profile-page-auth-btn');
        const profileEditBtn = document.getElementById('profile-page-edit-btn');
        const profileSettingsBtn = document.getElementById('profile-page-settings-btn');

        if (dataMe && dataMe.user) {
            if (dataMe.user.is_profile_completed === 0) {
                const onboardingModal = document.getElementById('onboarding-modal');
                if (onboardingModal) {
                    onboardingModal.style.display = 'flex';
                }
            }
            if (profileName) {
                let name = dataMe.user.name || dataMe.user.email;
                if (dataMe.user.verified) {
                    name += ' <span title="Verificado"><svg viewBox="0 0 24 24" width="16" height="16" fill="#3b82f6" style="vertical-align: -3px; margin-left: 2px;"><path d="M23 11.99l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 11.99l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 11.99zm-12.93 4.4L6.5 12.83l1.41-1.41 2.16 2.15 5.75-5.74 1.42 1.41-7.17 7.15z"/></svg></span>';
                }
                profileName.innerHTML = name;
            }
            if (profileDesc) {
                let descHTML = dataMe.user.username ? '@' + dataMe.user.username : dataMe.user.email;
                if (dataMe.user.category) {
                    let pillBg = '#e0f2fe';
                    let pillColor = '#0284c7';
                    let pillText = 'Gaditan Local';
                    if (dataMe.user.category === 'turista') {
                        pillBg = '#ffedd5';
                        pillColor = '#f97316';
                        pillText = 'Gaditan Turista';
                    } else if (dataMe.user.category === 'profesional') {
                        pillBg = '#dcfce7';
                        pillColor = '#16a34a';
                        pillText = 'Gaditan Profesional';
                    }
                    descHTML += `<div style="margin-top: 10px; line-height: 1;"><span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: ${pillBg}; color: ${pillColor};">${pillText}</span></div>`;
                }
                profileDesc.innerHTML = descHTML;
            }
            if (profileBio) {
                if (dataMe.user.bio) {
                    profileBio.innerText = dataMe.user.bio;
                    profileBio.style.display = 'block';
                } else {
                    profileBio.style.display = 'none';
                }
            }

            const profileStats = document.getElementById('profile-page-stats');
            const profilePostsCount = document.getElementById('profile-page-posts-count');
            const profileDate = document.getElementById('profile-page-date');
            
            if (profileStats && profilePostsCount) {
                profileStats.style.display = 'flex';
                const count = dataMe.user.posts_count || 0;
                profilePostsCount.textContent = count + (count === 1 ? ' Publicación' : ' Publicaciones');
            }
            
            if (profileDate) {
                if (dataMe.user.created_at) {
                    const d = new Date(dataMe.user.created_at);
                    profileDate.textContent = 'Miembro desde: ' + d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                    profileDate.style.display = 'block';
                } else {
                    profileDate.style.display = 'none';
                }
            }
            if (profileEditBtn) {
                profileEditBtn.style.display = 'block';
            }
            if (profileSettingsBtn) {
                profileSettingsBtn.style.display = 'flex';
            }
            if (profileAuthBtn) {
                profileAuthBtn.innerText = 'Cerrar Sesión';
                profileAuthBtn.style.background = '#fee2e2';
                profileAuthBtn.style.color = '#ef4444';
                profileAuthBtn.onclick = () => window.logout();
            }

            const activeAvatar = dataMe.user.picture || dataMe.user.avatar_url;
            if (activeAvatar && profileAvatarImg && profileAvatarEmoji) {
                profileAvatarImg.src = activeAvatar;
                profileAvatarImg.style.display = 'block';
                profileAvatarEmoji.style.display = 'none';
            }
            
            const headerAvatarImg = document.getElementById('profile-avatar');
            const headerProfileIcon = document.getElementById('profile-icon');
            if (headerAvatarImg && headerProfileIcon) {
                if (activeAvatar) {
                    headerAvatarImg.src = activeAvatar;
                    headerAvatarImg.style.display = 'block';
                    headerProfileIcon.style.display = 'none';
                }
            }
        } else {
            if (profileName) profileName.innerText = 'Invitado';
            if (profileDesc) profileDesc.innerText = 'Inicia sesión para guardar tus favoritos en la nube.';
            if (profileBio) profileBio.style.display = 'none';
            if (profileEditBtn) profileEditBtn.style.display = 'none';
            if (profileSettingsBtn) profileSettingsBtn.style.display = 'none';
            if (profileAuthBtn) {
                profileAuthBtn.innerText = 'Unirse a la Comunidad';
                profileAuthBtn.style.background = 'var(--primary-color)';
                profileAuthBtn.style.color = 'white';
                profileAuthBtn.onclick = () => window.openLoginModal();
            }
            if (profileAvatarImg && profileAvatarEmoji) {
                profileAvatarImg.style.display = 'none';
                profileAvatarEmoji.style.display = 'block';
            }
        }
    };

    window.openEditProfileModal = function() {
        const dataMe = (window as any).dataMe;
        if (!dataMe || !dataMe.user) return;
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            document.getElementById('edit-profile-name').value = dataMe.user.name || '';
            document.getElementById('edit-profile-username').value = dataMe.user.username || '';
            document.getElementById('edit-profile-bio').value = dataMe.user.bio || '';
            const catSelect = document.getElementById('edit-profile-category');
            if (catSelect) {
                catSelect.value = dataMe.user.category || 'local';
            }
            const privSelect = document.getElementById('edit-profile-dmprivacy');
            if (privSelect) {
                privSelect.value = dataMe.user.dm_privacy || 'everyone';
            }
            const avatarImg = document.getElementById('edit-profile-avatar');
            if (avatarImg) {
                avatarImg.src = dataMe.user.avatar_url || dataMe.user.picture || ('https://api.dicebear.com/7.x/notionists/svg?seed=' + dataMe.user.email);
            }
            document.getElementById('edit-profile-error').style.display = 'none';
            modal.style.display = 'flex';
        }
    };

    window.saveProfile = async function() {
        const dataMe = (window as any).dataMe;
        if (!dataMe || !dataMe.user) return;
        const name = document.getElementById('edit-profile-name').value.trim();
        const username = document.getElementById('edit-profile-username').value.trim().toLowerCase();
        const bio = document.getElementById('edit-profile-bio').value.trim();
        const catSelect = document.getElementById('edit-profile-category');
        const category = catSelect ? catSelect.value : 'local';
        const privSelect = document.getElementById('edit-profile-dmprivacy');
        const dmPrivacy = privSelect ? privSelect.value : 'everyone';
        const btn = document.getElementById('edit-profile-submit');
        const errorEl = document.getElementById('edit-profile-error');
        
        if (!name || !username) {
            errorEl.innerText = 'El nombre y usuario son obligatorios.';
            errorEl.style.display = 'block';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = 'Guardando...';
        errorEl.style.display = 'none';

        try {
            const res = await fetch('/api/users/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, bio, category, dmPrivacy })
            });

            if (!res.ok && res.status === 401) {
                errorEl.innerText = 'Tu sesión ha expirado. Por favor, recarga la página.';
                errorEl.style.display = 'block';
                return;
            }

            const data = await res.json();
            if (data.success) {
                dataMe.user.name = name;
                dataMe.user.username = username;
                dataMe.user.bio = bio;
                dataMe.user.category = category;
                dataMe.user.dm_privacy = dmPrivacy;
                if (window.updateProfileUI) {
                    window.updateProfileUI(dataMe);
                }
                document.getElementById('edit-profile-modal').style.display = 'none';
            } else {
                errorEl.innerText = data.error || 'Error al guardar el perfil.';
                errorEl.style.display = 'block';
            }
        } catch (e) {
            errorEl.innerText = 'Error de conexión o de servidor (' + e.message + ').';
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Guardar Cambios';
        }
    };

    window.renderSavedMessages = async function() {
        const container = document.getElementById('saved-messages-container');
        if (!container) return;
        
        let saved = JSON.parse(localStorage.getItem('cadiz_saved_messages') || '[]');
        
        if (saved.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; margin-top:40px;">No tienes mensajes guardados aún.</p>';
            return;
        }

        container.innerHTML = '';
        [...saved].reverse().forEach((html, i) => {
            const div = document.createElement('div');
            div.className = 'message bot';
            const rawContent = encodeURIComponent(html);
            div.innerHTML = `${html}<div class="message-meta" style="justify-content: flex-end; display: flex; width: 100%; margin-top: 8px;"><button class="action-btn" onclick="window.saveMessage(this, '${rawContent}')" aria-label="Eliminar" style="background: #fee2e2; color: #ef4444; border: none; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">🗑️ Eliminar de Guardados</button></div>`;
            container.appendChild(div);
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (window.updateBookmarksBadge) window.updateBookmarksBadge();
        window.renderSavedMessages();
        const swiper = document.getElementById('main-swiper');
        if (swiper) {
            setTimeout(() => {
                swiper.scrollTo({ left: swiper.clientWidth, behavior: 'instant' });
                
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('login') === 'success') {
                    if (typeof window.switchTab === 'function') {
                        window.switchTab('muro');
                    }
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }, 50);
        }

        let cropperInstance: any = null;

        (window as any).cancelAvatarCrop = function() {
            if (cropperInstance) {
                cropperInstance.destroy();
                cropperInstance = null;
            }
            document.getElementById('avatar-crop-modal')!.style.display = 'none';
            const avatarInput = document.getElementById('avatar-upload-input') as HTMLInputElement;
            if (avatarInput) avatarInput.value = '';
            const avatarContainer = document.getElementById('avatar-upload-container');
            if (avatarContainer) avatarContainer.style.opacity = '1';
        };

        (window as any).applyAvatarCrop = async function() {
            if (!cropperInstance) return;
            const btn = document.getElementById('avatar-crop-submit') as HTMLButtonElement;
            btn.innerHTML = 'Subiendo...';
            btn.disabled = true;

            try {
                const canvas = cropperInstance.getCroppedCanvas({
                    width: 256,
                    height: 256,
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high',
                });

                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
                if (!blob) throw new Error('No se pudo recortar la imagen');

                const response = await fetch('/api/users/avatar', {
                    method: 'POST',
                    body: blob
                });

                const data = await response.json();
                if (data.success && data.url) {
                    const avatarImg = document.getElementById('profile-page-avatar-img') as HTMLImageElement;
                    const avatarEmoji = document.getElementById('profile-page-avatar-emoji');
                    if (avatarImg && avatarEmoji) {
                        avatarImg.src = data.url;
                        avatarImg.style.display = 'block';
                        avatarEmoji.style.display = 'none';
                    }
                    
                    const dataMe = (window as any).dataMe;
                    if (dataMe && dataMe.user) {
                        dataMe.user.picture = data.url;
                        if ((window as any).updateProfileUI) {
                            (window as any).updateProfileUI(dataMe);
                        }
                    }
                    
                    (window as any).cancelAvatarCrop();
                } else {
                    alert('Error subiendo foto: ' + (data.error || 'Desconocido'));
                }
            } catch (err) {
                console.error(err);
                alert('Error procesando imagen');
            } finally {
                btn.innerHTML = 'Aplicar Foto';
                btn.disabled = false;
            }
        };

        const avatarInput = document.getElementById('avatar-upload-input') as HTMLInputElement;
        if (avatarInput) {
            avatarInput.addEventListener('change', async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const avatarContainer = document.getElementById('avatar-upload-container');
                if (avatarContainer) avatarContainer.style.opacity = '0.5';

                const objUrl = URL.createObjectURL(file);
                const cropImage = document.getElementById('avatar-crop-image') as HTMLImageElement;
                cropImage.src = objUrl;

                document.getElementById('avatar-crop-modal')!.style.display = 'flex';

                if (cropperInstance) {
                    cropperInstance.destroy();
                }
                
                setTimeout(() => {
                    const Cropper = (window as any).Cropper;
                    cropperInstance = new Cropper(cropImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                        dragMode: 'move',
                        autoCropArea: 1,
                        restore: false,
                        guides: false,
                        center: false,
                        highlight: false,
                        cropBoxMovable: false,
                        cropBoxResizable: false,
                        toggleDragModeOnDblclick: false,
                    });
                }, 50);
            });
        }

    });

    const TARIFF_DATA: Record<string, any> = {
        urbana: {
            dia: [
                { name: 'Bajada de Bandera', price: '1.39 €' },
                { name: 'Precio por Kilómetro', price: '0.70 €' },
                { name: 'Carrera Mínima', price: '3.56 €' },
                { name: 'Hora de Espera', price: '18.95 €' }
            ],
            noche: [
                { name: 'Bajada de Bandera', price: '1.73 €' },
                { name: 'Precio por Kilómetro', price: '0.90 €' },
                { name: 'Carrera Mínima', price: '4.43 €' },
                { name: 'Hora de Espera', price: '23.66 €' }
            ],
            finde: [
                { name: 'Bajada de Bandera', price: '1.73 €' },
                { name: 'Precio por Kilómetro', price: '0.90 €' },
                { name: 'Carrera Mínima', price: '4.43 €' },
                { name: 'Hora de Espera', price: '23.66 €' }
            ],
            festivo: [
                { name: 'Bajada de Bandera', price: '1.73 €' },
                { name: 'Precio por Kilómetro', price: '0.90 €' },
                { name: 'Carrera Mínima', price: '4.43 €' },
                { name: 'Hora de Espera', price: '23.66 €' }
            ]
        },
        interurbana: {
            dia: [
                { name: 'Bajada de Bandera (<12km)', price: '3.66 €' },
                { name: 'Precio por Kilómetro', price: '0.71 €' },
                { name: 'Mínimo de Percepción', price: '3.83 €' },
                { name: 'Hora de Espera', price: '17.57 €' }
            ],
            noche: [
                { name: 'Bajada de Bandera (<12km)', price: '3.60 €' },
                { name: 'Precio por Kilómetro', price: '0.82 €' },
                { name: 'Mínimo de Percepción', price: '4.51 €' },
                { name: 'Hora de Espera', price: '20.71 €' }
            ],
            finde: [
                { name: 'Bajada de Bandera (<12km)', price: '3.60 €' },
                { name: 'Precio por Kilómetro', price: '0.82 €' },
                { name: 'Mínimo de Percepción', price: '4.51 €' },
                { name: 'Hora de Espera', price: '20.71 €' }
            ],
            festivo: [
                { name: 'Bajada de Bandera (<12km)', price: '3.60 €' },
                { name: 'Precio por Kilómetro', price: '0.82 €' },
                { name: 'Mínimo de Percepción', price: '4.51 €' },
                { name: 'Hora de Espera', price: '20.71 €' }
            ]
        },
        suplementos: [
            { name: 'Maleta o Bulto', price: '0.51 €', info: 'Por cada bulto en el maletero. ¡Ojo! Los carritos de bebé, carros de la compra, sillas de ruedas, andadores, bicis plegables y patinetes viajan siempre gratis.' },
            { name: 'Recogida Estación (Tren/Bus)', price: '0.82 €', info: 'Solo aplica si te recogen en la estación. Si tu viaje termina allí, no se cobra.' },
            { name: 'Entrada Astilleros/Puertos', price: '1.06 €', info: 'Aplica si el viaje empieza o termina dentro del Puerto, Astilleros o Espigones (compensa el acceso a zonas restringidas).' },
            { name: 'Destino Cortadura-Torregorda', price: '4.46 €', info: 'Recargo fijo para trayectos con origen o destino en la zona periférica entre Cortadura y Torregorda.' },
            { name: 'Plaza adicional (6ª y 7ª)', price: '0.91 €', info: 'Se suma por cada persona a partir de la quinta plaza. No se cobra si en el grupo viaja alguien con movilidad reducida.' }
        ]
    };

    const HOLIDAYS: Record<string, string> = {
        "01/01/2026": "Año Nuevo",
        "06/01/2026": "Reyes Magos",
        "16/02/2026": "Lunes de Coros (Carnaval)",
        "28/02/2026": "Día de Andalucía",
        "02/04/2026": "Jueves Santo",
        "03/04/2026": "Viernes Santo",
        "01/05/2026": "Fiesta del Trabajo",
        "15/08/2026": "Asunción de la Virgen",
        "07/10/2026": "Virgen del Rosario",
        "12/10/2026": "Fiesta Nacional",
        "02/11/2026": "Todos los Santos",
        "07/12/2026": "Día de la Constitución",
        "08/12/2026": "Inmaculada Concepción",
        "25/12/2026": "Navidad",
        "01/01/2027": "Año Nuevo",
        "06/01/2027": "Reyes Magos",
        "08/02/2027": "Lunes Carnaval",
        "01/03/2027": "Día de Andalucía",
        "25/03/2027": "Jueves Santo",
        "26/03/2027": "Viernes Santo",
        "01/05/2027": "Fiesta del Trabajo",
        "16/08/2027": "Asunción de la Virgen",
        "07/10/2027": "Virgen del Rosario",
        "12/10/2027": "Fiesta Nacional",
        "01/11/2027": "Todos los Santos",
        "06/12/2027": "Día de la Constitución",
        "08/12/2027": "Inmaculada Concepción",
        "25/12/2027": "Navidad"
    };

    const widgetState: Record<string, { type: string, time: string }> = {};

    let liveMap: any = null;
    let liveRoutingControl: any = null;
    let watchId: number | null = null;
    let userMarker: any = null;

    window.startLiveNavigation = function(destLatStr: string, destLonStr: string, destName: string) {
        const layer = document.getElementById('fullscreen-nav-layer');
        if (!layer) return;
        
        const destLat = parseFloat(destLatStr);
        const destLon = parseFloat(destLonStr);

        layer.classList.remove('closed');

        setTimeout(() => {
            const mapL = (window as any).L;
            if (!liveMap) {
                liveMap = mapL.map('nav-map', { zoomControl: false }).setView([destLat, destLon], 16);
                liveMap.createPane('labels');
                liveMap.getPane('labels').style.zIndex = 500;
                liveMap.getPane('labels').style.pointerEvents = 'none';

                mapL.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap, © CartoDB', subdomains: 'abcd', maxZoom: 20
                }).addTo(liveMap);

                mapL.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
                    subdomains: 'abcd', maxZoom: 20,
                    pane: 'labels'
                }).addTo(liveMap);
                
                mapL.control.zoom({ position: 'bottomright' }).addTo(liveMap);
            }

            if (liveRoutingControl) {
                liveMap.removeControl(liveRoutingControl);
                liveRoutingControl = null;
            }
            if (userMarker) {
                liveMap.removeLayer(userMarker);
                userMarker = null;
            }

            const destIcon = mapL.divIcon({
                className: '',
                html: '<div class="destination-marker">📍</div>',
                iconSize: [32, 38],
                iconAnchor: [16, 38],
                popupAnchor: [0, -38]
            });
            mapL.marker([destLat, destLon], { icon: destIcon }).addTo(liveMap).bindPopup(destName).openPopup();

            const devBtn = document.getElementById('nav-dev-btn');
            if (devBtn) {
                devBtn.style.display = 'block';
                let isDevModeActive = false;
                devBtn.onclick = () => {
                    isDevModeActive = true;
                    devBtn.innerText = 'CLIC EN EL MAPA';
                    devBtn.style.background = '#388e3c';
                };
                liveMap.on('click', (e: any) => {
                    if (isDevModeActive) {
                        updateUserLocation(e.latlng.lat, e.latlng.lng, destLat, destLon, true);
                        isDevModeActive = false;
                        devBtn.innerText = 'DEV: FAKE GPS';
                        devBtn.style.background = 'rgba(211, 47, 47, 0.9)';
                    }
                });
            }

            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        updateUserLocation(position.coords.latitude, position.coords.longitude, destLat, destLon, false);
                    },
                    (error) => {
                        console.error("GPS Error:", error);
                        document.getElementById('nav-instruction-text')!.innerText = "Esperando señal GPS...";
                    },
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            } else {
                document.getElementById('nav-instruction-text')!.innerText = "GPS no disponible.";
            }

        }, 400);
    };

    function updateUserLocation(userLat: number, userLon: number, destLat: number, destLon: number, isFake: boolean) {
        const mapL = (window as any).L;
        
        const userIcon = mapL.divIcon({
            className: '',
            html: '<div class="user-gps-marker"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        if (!userMarker) {
            userMarker = mapL.marker([userLat, userLon], { icon: userIcon }).addTo(liveMap);
        } else {
            userMarker.setLatLng([userLat, userLon]);
            userMarker.setIcon(userIcon);
        }

        if (!liveRoutingControl) {
            liveRoutingControl = mapL.Routing.control({
                waypoints: [ mapL.latLng(userLat, userLon), mapL.latLng(destLat, destLon) ],
                router: mapL.Routing.osrmv1({
                    serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
                    profile: 'foot'
                }),
                routeWhileDragging: false,
                language: 'es',
                showAlternatives: false,
                show: false,
                addWaypoints: false,
                createMarker: function() { return null; },
                lineOptions: {
                    styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }]
                }
            }).addTo(liveMap);

            liveRoutingControl.on('routesfound', function(e: any) {
                const route = e.routes[0];
                const summary = route.summary;
                const instructions = route.instructions;

                const etaMin = Math.ceil(summary.totalTime / 60);
                const distKm = (summary.totalDistance / 1000).toFixed(1);
                document.getElementById('nav-eta')!.innerText = `${etaMin} min`;
                document.getElementById('nav-distance')!.innerText = `${distKm} km`;

                let currentInstruction = instructions[0];
                if (currentInstruction.type === 'Head' && instructions.length > 1 && currentInstruction.distance < 10) {
                    currentInstruction = instructions[1];
                }

                if (currentInstruction) {
                    let icon = '⬆️';
                    const t = currentInstruction.type.toLowerCase();
                    if (t.includes('left')) icon = '⬅️';
                    if (t.includes('right')) icon = '➡️';
                    if (t.includes('arrive') || t.includes('destinationreached')) icon = '📍';
                    if (t.includes('roundabout')) icon = '🔄';
                    if (t.includes('turnaround')) icon = '↩️';
                    
                    document.getElementById('nav-instruction-icon')!.innerText = icon;
                    document.getElementById('nav-instruction-text')!.innerText = currentInstruction.text;
                    
                    if (currentInstruction.distance > 0) {
                        document.getElementById('nav-instruction-dist')!.innerText = `en ${Math.round(currentInstruction.distance)} m`;
                    } else {
                        document.getElementById('nav-instruction-dist')!.innerText = '';
                    }
                }
            });
        } else {
            liveRoutingControl.setWaypoints([
                mapL.latLng(userLat, userLon),
                mapL.latLng(destLat, destLon)
            ]);
        }
    }

    window.exitLiveNavigation = function() {
        const layer = document.getElementById('fullscreen-nav-layer');
        if (layer) layer.classList.add('closed');
        
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        
        if (liveRoutingControl) {
            liveMap.removeControl(liveRoutingControl);
            liveRoutingControl = null;
        }
        if (userMarker) {
            liveMap.removeLayer(userMarker);
            userMarker = null;
        }
    };

    window.sendToAI = sendMessageToAI;

    sendButton?.addEventListener('click', () => {
        sendMessageToAI(inputField.value);
    });

    inputField?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageToAI(inputField.value);
        }
    });

    setTimeout(() => {
        sendMessageToAI('¡Hola! Acabo de entrar a la web. Preséntate brevemente de forma muy natural y dime en qué puedes ayudarme. NO añadas sugerencias ni listas en tu mensaje de texto, usa EXCLUSIVAMENTE los bloques de sugerencia de la interfaz.', true);
    }, 500);

    window.openWeatherModal = () => {
        const overlay = document.getElementById('weather-modal-overlay');
        const modal = document.getElementById('weather-modal');
        if (overlay && modal) {
            overlay.style.display = 'block';
            modal.style.display = 'block';
            setTimeout(() => {
                overlay.style.opacity = '1';
                modal.style.bottom = '0';
            }, 10);
        }
    };

    window.closeWeatherModal = () => {
        const overlay = document.getElementById('weather-modal-overlay');
        const modal = document.getElementById('weather-modal');
        if (overlay && modal) {
            overlay.style.opacity = '0';
            modal.style.bottom = '-100%';
            setTimeout(() => {
                overlay.style.display = 'none';
                modal.style.display = 'none';
            }, 300);
        }
    };

    const subtitleEl = document.getElementById('header-subtitle');
    const savedCity = localStorage.getItem('cadiz_city');
    if (subtitleEl && savedCity) {
        subtitleEl.textContent = savedCity;
    } else if (subtitleEl) {
        subtitleEl.textContent = "Cádiz Capital";
    }

    const citiesList = [
        "Alcalá de los Gazules", "Alcalá del Valle", "Algar", "Algeciras", "Algodonales", 
        "Arcos de la Frontera", "Barbate", "Los Barrios", "Benaocaz", "Bornos", "El Bosque", 
        "Cádiz", "Castellar de la Frontera", "Conil de la Frontera", "Chiclana de la Frontera", 
        "Chipiona", "Espera", "El Gastor", "Grazalema", "Jerez de la Frontera", 
        "Jimena de la Frontera", "La Línea de la Concepción", "Medina-Sidonia", "Olvera", 
        "Paterna de Rivera", "Prado del Rey", "El Puerto de Santa María", "Puerto Real", 
        "Puerto Serrano", "Rota", "San Fernando", "Sanlúcar de Barrameda", "San Roque", 
        "Setenil de las Bodegas", "Tarifa", "Torre Alháquime", "Trebujena", "Ubrique", 
        "Vejer de la Frontera", "Villaluenga del Rosario", "Villamartín", "Zahara", 
        "Benalup-Casas Viejas", "San José del Valle"
    ].sort();

    const renderCityList = (list: string[], ul: HTMLElement, currentCity: string) => {
        ul.innerHTML = '';
        if (list.length === 0) {
            ul.innerHTML = '<li style="padding: 16px; color: var(--text-secondary); text-align: center;">No se encontraron municipios</li>';
            return;
        }
        list.forEach(city => {
            const li = document.createElement('li');
            li.style.cssText = `padding: 16px; border-bottom: 1px solid var(--border-color); cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: ${city === currentCity ? 'var(--primary-color)' : 'inherit'}; font-weight: ${city === currentCity ? 'bold' : 'normal'};`;
            li.innerHTML = `<span>${city}</span> ${city === currentCity ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}`;
            li.onclick = () => (window as any).selectCity(city);
            ul.appendChild(li);
        });
    };

    (window as any).filterCities = (query: string) => {
        const ul = document.getElementById('city-list');
        if (!ul) return;
        const currentCity = localStorage.getItem('cadiz_city') || "Cádiz";
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const filtered = citiesList.filter(city => {
            const normalizedCity = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedCity.includes(normalizedQuery);
        });
        renderCityList(filtered, ul, currentCity);
    };

    (window as any).openCityModal = () => {
        const modal = document.getElementById('city-modal');
        const overlay = document.getElementById('city-modal-overlay');
        const ul = document.getElementById('city-list');
        if (modal && overlay && ul) {
            const searchInput = document.getElementById('city-search-input') as HTMLInputElement;
            if (searchInput) searchInput.value = '';
            
            const currentCity = localStorage.getItem('cadiz_city') || "Cádiz";
            renderCityList(citiesList, ul, currentCity);
            overlay.style.display = 'block';
            modal.style.display = 'flex';
            setTimeout(() => {
                overlay.style.opacity = '1';
                modal.style.bottom = '0';
                if (searchInput) searchInput.focus();
            }, 50);
        }
    };

    (window as any).closeCityModal = () => {
        const modal = document.getElementById('city-modal');
        const overlay = document.getElementById('city-modal-overlay');
        if (modal && overlay) {
            modal.style.bottom = '-100%';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                modal.style.display = 'none';
            }, 300);
        }
    };

    (window as any).selectCity = (city: string) => {
        const isFromWeatherModal = document.getElementById('weather-modal')?.style.display === 'block';
        
        localStorage.setItem('cadiz_city', city);
        if (subtitleEl) subtitleEl.textContent = city;
        (window as any).closeCityModal();
        
        const weatherChip = document.getElementById('header-weather-chip');
        if (weatherChip) weatherChip.style.display = 'none';
        
        (window as any).fetchWeatherWithRetryFn();
        
        if (!isFromWeatherModal) {
            const messagesDiv = document.getElementById('chat-messages');
            if (messagesDiv) messagesDiv.innerHTML = '';
            chatHistory.length = 0; 
            sendMessageToAI('¡Hola! Acabo de entrar a la web. Preséntate brevemente de forma muy natural y dime en qué puedes ayudarme. NO añadas sugerencias ni listas en tu mensaje de texto, usa EXCLUSIVAMENTE los bloques de sugerencia de la interfaz.', true);
        }
    };

    let weatherRequestId = 0;

    setTimeout(() => {
        const fetchWeatherWithRetry = (retriesLeft = 3, delay = 2000, reqId = null) => {
            const currentReqId = reqId !== null ? reqId : ++weatherRequestId;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const savedCityQuery = localStorage.getItem('cadiz_city') ? `&city=${encodeURIComponent(localStorage.getItem('cadiz_city')!)}` : '';
            fetch('/api/weather?t=' + new Date().getTime() + savedCityQuery, { signal: controller.signal })
                .then(wRes => {
                    clearTimeout(timeoutId);
                    if (!wRes.ok) throw new Error('Fetch failed with status: ' + wRes.status);
                    return wRes.json();
                })
                .then(wData => {
                    if (currentReqId !== weatherRequestId) return;
                    const chip = document.getElementById('header-weather-chip');
                    const iconSpan = document.getElementById('header-weather-icon');
                    const tempSpan = document.getElementById('header-weather-temp');
                    
                    if (!wData.error && wData.current && wData.current.temp !== 'N/A') {
                        let filteredHourly = wData.hourly || [];
                        if (wData.hourly && wData.hourly.length > 0) {
                            const now = new Date();
                            const currentHourStr = now.getHours().toString().padStart(2, '0');
                            const currentFechaStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,'0') + "-" + String(now.getDate()).padStart(2,'0');

                            filteredHourly = wData.hourly.filter(h => {
                                if (!h.fecha) return true;
                                const hFecha = h.fecha.substring(0, 10);
                                if (hFecha < currentFechaStr) return false;
                                if (hFecha === currentFechaStr && h.periodo < currentHourStr) return false;
                                return true;
                            });
                            if (filteredHourly.length === 0) filteredHourly = wData.hourly;
                            
                            const currentHourly = filteredHourly[0];
                            if (currentHourly) {
                                wData.current.temp = currentHourly.temp || wData.current.temp;
                                wData.current.feelsLike = currentHourly.feelsLike || wData.current.feelsLike;
                                wData.current.skyDesc = currentHourly.skyDesc || wData.current.skyDesc;
                                wData.current.windDir = currentHourly.windDir || wData.current.windDir;
                                wData.current.windSpeed = currentHourly.windSpeed || wData.current.windSpeed;
                                wData.current.humidity = currentHourly.humidity || wData.current.humidity;
                            }
                        }

                        let weatherIcon = '⛅';
                        const desc = (wData.current.skyDesc || '').toLowerCase();
                        if (desc.includes('lluvia') || desc.includes('chubasco') || desc.includes('tormenta')) weatherIcon = '🌧️';
                        else if (desc.includes('poco nuboso') || desc.includes('intervalos nubosos')) weatherIcon = '⛅';
                        else if (desc.includes('nubo') || desc.includes('cubierto')) weatherIcon = '☁️';
                        else if (desc.includes('despejado')) weatherIcon = '☀️';

                        if (chip && iconSpan && tempSpan) {
                            iconSpan.innerText = weatherIcon;
                            tempSpan.innerText = `${wData.current.temp}º`;
                            chip.style.display = 'flex';
                        }

                        document.getElementById('weather-modal-location').innerText = wData.location || 'Cádiz';

                        let alertsHtml = '';
                        if (wData.alerts && wData.alerts.length > 0) {
                            const alert = wData.alerts[0];
                            let bg = '#ef4444';
                            if (alert.nivel === 'amarillo') bg = '#eab308';
                            if (alert.nivel === 'naranja') bg = '#f97316';
                            alertsHtml = `
                                <div style="margin-bottom: 16px; padding: 10px 14px; border-radius: 8px; background-color: ${bg}15; border-left: 4px solid ${bg}; display: flex; align-items: flex-start; gap: 10px;">
                                    <div style="font-size: 1.2rem;">⚠️</div>
                                    <div style="text-align: left;">
                                        <div style="color: ${bg}; font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">Aviso ${alert.nivel}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 2px;">${alert.descripcion}</div>
                                    </div>
                                </div>
                            `;
                        }
                        document.getElementById('weather-modal-alerts').innerHTML = alertsHtml;

                        const getWindName = (dir) => {
                            const d = dir ? dir.toUpperCase() : '';
                            if (['E', 'SE', 'NE'].includes(d)) return 'LEVANTE';
                            if (['O', 'SO', 'NO', 'W', 'SW', 'NW'].includes(d)) return 'PONIENTE';
                            if (d === 'S') return 'SUR';
                            if (d === 'N') return 'NORTE';
                            if (d === 'C') return 'CALMA';
                            return d;
                        };
                        let windStr = '--';
                        if (wData.current.windSpeed && wData.current.windSpeed !== 'N/A') {
                            const windName = getWindName(wData.current.windDir);
                            const windNamePill = windName ? `<span style="display: inline-block; background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; margin-left: 6px; vertical-align: middle;">${windName}</span>` : '';
                            windStr = `<div style="display: flex; align-items: center;">${wData.current.windSpeed} km/h${windNamePill}</div>`;
                        }
                        const tMax = (wData.daily && wData.daily.tempMax !== 'N/A') ? wData.daily.tempMax + 'º' : '--';
                        const tMin = (wData.daily && wData.daily.tempMin !== 'N/A') ? wData.daily.tempMin + 'º' : '--';
                        const uvMax = (wData.daily && wData.daily.uvMax !== 'N/A') ? wData.daily.uvMax : '--';
                        const currentHumidity = (wData.current.humidity && wData.current.humidity !== 'N/A') ? wData.current.humidity + '%' : '--';

                        const getEmoji = (desc) => {
                            if (!desc) return '⛅';
                            const d = desc.toLowerCase();
                            if (d.includes('lluvia') || d.includes('chubasco') || d.includes('tormenta')) return '🌧️';
                            if (d.includes('poco nuboso') || d.includes('intervalos nubosos')) return '⛅';
                            if (d.includes('nubo') || d.includes('cubierto')) return '☁️';
                            if (d.includes('despejado')) return '☀️';
                            return '⛅';
                        };

                        const currentEmoji = getEmoji(wData.current.skyDesc);

                        let feelsLikeHtml = '';
                        if (wData.current.feelsLike && wData.current.feelsLike !== 'N/A') {
                            feelsLikeHtml = ` • Sensación de ${wData.current.feelsLike}º`;
                        }

                        document.getElementById('weather-modal-current').innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                                <div style="font-size: 3.5rem; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">${currentEmoji}</div>
                                <div style="text-align: left;">
                                    <div style="font-size: 3rem; font-weight: 700; color: var(--text-primary); line-height: 1; letter-spacing: -1px;">${wData.current.temp}º</div>
                                    <div style="font-size: 1rem; color: var(--text-secondary); margin-top: 4px; font-weight: 500;">
                                        <span style="text-transform: capitalize;">${wData.current.skyDesc}</span>${feelsLikeHtml}
                                    </div>
                                    <div style="font-size: 0.9rem; margin-top: 4px; font-weight: 600; color: var(--text-primary);">
                                        <span style="color: #ef4444;">↑ ${tMax}</span> <span style="color: var(--text-secondary); margin: 0 4px;">|</span> <span style="color: #3b82f6;">↓ ${tMin}</span>
                                    </div>
                                </div>
                            </div>
                        `;

                        let hourlyHtml = '';
                        if (wData.hourly && wData.hourly.length > 0) {
                            filteredHourly.slice(0, 24).forEach((h, index) => {
                                const hEmoji = getEmoji(h.skyDesc);
                                const isNow = index === 0;
                                const label = isNow ? 'Ahora' : `${h.periodo}h`;
                                hourlyHtml += `
                                    <div style="display: flex; flex-direction: column; align-items: center; min-width: 60px; padding: 12px 8px; background: ${isNow ? 'var(--primary-color)' : 'var(--chat-bg)'}; color: ${isNow ? 'white' : 'var(--text-primary)'}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); flex-shrink: 0;">
                                        <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">${label}</div>
                                        <div style="font-size: 1.5rem; margin-bottom: 8px;">${hEmoji}</div>
                                        <div style="font-size: 1rem; font-weight: 700;">${h.temp}º</div>
                                        <div style="font-size: 0.7rem; font-weight: 500; color: ${isNow ? 'rgba(255,255,255,0.8)' : '#3b82f6'}; margin-top: 4px; display: flex; flex-direction: column; align-items: center; gap: 2px;">
                                            ${parseInt(h.probPrecipitacion) > 0 ? `
                                            <div style="display: flex; align-items: center;">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px; opacity:0.8;"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>
                                                ${h.probPrecipitacion}%
                                            </div>
                                            ` : ''}
                                            ${(parseFloat(h.precip || '0') > 0) ? `<div style="font-size: 0.65rem; font-weight: 400; color: ${isNow ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'}; margin-top: -2px;">${parseFloat(h.precip)} mm</div>` : ''}
                                        </div>
                                        ${(h.windSpeed && h.windSpeed !== 'N/A') ? `<div style="font-size: 0.7rem; font-weight: 600; color: ${isNow ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'}; margin-top: 4px; text-align: center;">${h.windSpeed} Km/h</div>${(h.windDir && h.windDir !== 'N/A' && h.windDir !== 'C') ? `<div style="font-size: 0.55rem; font-weight: 700; color: ${isNow ? 'white' : '#3b82f6'}; background: ${isNow ? 'rgba(255,255,255,0.2)' : 'rgba(59, 130, 246, 0.1)'}; padding: 2px 6px; border-radius: 8px; margin-top: 4px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">${getWindName(h.windDir)}</div>` : ''}` : ''}
                                    </div>
                                `;
                            });
                        } else {
                            hourlyHtml = '<div style="color: var(--text-secondary); font-size: 0.85rem; padding: 8px 0;">Previsión horaria no disponible</div>';
                        }
                        document.getElementById('weather-hourly-list').innerHTML = hourlyHtml;

                        let forecastHtml = '';
                        if (wData.forecast && wData.forecast.length > 0) {
                            wData.forecast.forEach((f, index) => {
                                const dateObj = new Date(f.date);
                                const dayName = index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                                
                                let fEmoji = '☀️';
                                if (f.probPrecipitacion > 60) fEmoji = '🌧️';
                                else if (f.probPrecipitacion > 20) fEmoji = '⛅';

                                forecastHtml += `
                                    <div style="display: flex; flex-direction: column; padding: 12px 0; border-bottom: ${index === wData.forecast.length - 1 ? 'none' : '1px solid var(--border-color)'}; margin-bottom: ${index === wData.forecast.length - 1 ? '0' : '4px'};">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                            <div style="font-weight: 600; text-transform: capitalize; color: var(--text-primary); font-size: 1rem; display: flex; align-items: center; gap: 10px;">
                                                <span style="font-size: 1.3rem;">${fEmoji}</span>
                                                ${dayName}
                                            </div>
                                            <div style="font-weight: 600; display: flex; align-items: center; gap: 6px; font-size: 0.95rem; white-space: nowrap;">
                                                <span style="color: #ef4444;">↑ ${f.max}º</span>
                                                <span style="color: var(--text-secondary); opacity: 0.5;">|</span>
                                                <span style="color: #3b82f6;">↓ ${f.min}º</span>
                                            </div>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; padding-left: 36px;">
                                            <div style="color: #3b82f6; display: flex; align-items: center;">
                                                ${parseInt(f.probPrecipitacion) > 0 ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; opacity:0.8;"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>${f.probPrecipitacion}%` : ''}
                                            </div>
                                            <div>
                                                ${f.windMax && f.windMax !== 'N/A' ? `${f.windMax} Km/h` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                        } else {
                            forecastHtml = '<div style="color: var(--text-secondary); font-size: 0.85rem;">Previsión a 7 días no disponible</div>';
                        }
                        document.getElementById('weather-forecast-list').innerHTML = forecastHtml;

                        let cardsList = [];

                        cardsList.push(`
                            <div class="weather-viento-card" style="background: var(--chat-bg); padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                                <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                                    Viento
                                </div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${windStr}</div>
                            </div>
                        `);
                        cardsList.push(`
                            <div style="background: var(--chat-bg); padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                                <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                                    Humedad
                                </div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${currentHumidity}</div>
                            </div>
                        `);
                        cardsList.push(`
                            <div style="background: var(--chat-bg); padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                                <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                                    Índice UV
                                </div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${uvMax}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Máximo de hoy</div>
                            </div>
                        `);

                        if (wData.tides && wData.tides.length > 0) {
                            const now = new Date();
                            const currentHour = now.getHours() + now.getMinutes() / 60;
                            const nextTide = wData.tides.find(t => {
                                const parts = t.time.split(':');
                                const tHour = parseInt(parts[0]) + parseInt(parts[1])/60;
                                return tHour > currentHour;
                            }) || wData.tides[0];
                            
                            cardsList.push(`
                            <div style="background: var(--chat-bg); padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                                <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"></path><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"></path></svg>
                                    Mareas
                                </div>
                                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); text-transform: capitalize;">${nextTide.type}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">a las ${nextTide.time}h</div>
                            </div>
                            `);
                        }

                        const currentFechaStr = new Date().getFullYear() + "-" + String(new Date().getMonth()+1).padStart(2,'0') + "-" + String(new Date().getDate()).padStart(2,'0');
                        const totalPrecip = wData.hourly ? wData.hourly.filter(h => h.fecha === currentFechaStr).reduce((acc, curr) => acc + (parseFloat(curr.precip) || 0), 0) : 0;
                        if (totalPrecip > 0) {
                            const precipVal = totalPrecip.toFixed(1).replace('.0', '') + ' mm';
                            cardsList.push(`
                            <div style="background: var(--chat-bg); padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                                <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>
                                    Lluvia Hoy
                                </div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${precipVal}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Total esperado</div>
                            </div>
                            `);
                        }

                        let snowLevel = "0";
                        if (wData.forecast && wData.forecast[0] && wData.forecast[0].cotaNieve && wData.forecast[0].cotaNieve.length > 0) {
                            const todaySnowArr = wData.forecast[0].cotaNieve;
                            const snowValObj = todaySnowArr.find(c => c.value && c.value !== "0" && c.value !== "");
                            if (snowValObj) snowLevel = snowValObj.value;
                        }
                        if (snowLevel !== "0" && snowLevel !== "N/A" && snowLevel !== "") {
                            cardsList.push(`
                            <div style="background: var(--chat-bg); padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                                <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19v-2"/><path d="M6.5 19v-2"/><path d="M12 22v-2"/><path d="M12 13v-3"/><path d="m14 12-2-2-2 2"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/></svg>
                                    Cota de Nieve
                                </div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${snowLevel}m</div>
                            </div>
                            `);
                        }

                        let orto = "--", ocaso = "--";
                        if (wData.forecast && wData.forecast[0]) {
                            orto = wData.forecast[0].orto || "--";
                            ocaso = wData.forecast[0].ocaso || "--";
                        }
                        if (orto !== "--" && ocaso !== "--") {
                            cardsList.push(`
                            <div style="background: var(--chat-bg); padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                                    <div style="display:flex; align-items:center; gap: 4px;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>
                                        Amanecer
                                    </div>
                                    <div style="display:flex; align-items:center; gap: 4px;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>
                                        Atardecer
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${orto}</div>
                                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${ocaso}</div>
                                </div>
                            </div>
                            `);
                        }

                        if (cardsList.length % 2 !== 0) {
                            cardsList[0] = cardsList[0].replace('class="weather-viento-card" style="', 'class="weather-viento-card" style="grid-column: 1 / -1; ');
                        }

                        document.getElementById('weather-modal-details').innerHTML = cardsList.join('');
                        
                    } else {
                        throw new Error('API returned error or N/A');
                    }
                })
                .catch(e => {
                    if (currentReqId !== weatherRequestId) return;
                    console.error('Weather fetch error:', e);
                    if (retriesLeft > 0) {
                        setTimeout(() => fetchWeatherWithRetry(retriesLeft - 1, delay * 1.5, currentReqId), delay);
                    }
                });
        };
        (window as any).fetchWeatherWithRetryFn = fetchWeatherWithRetry;
        fetchWeatherWithRetry();
    }, 500);

    window.logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.reload();
        } catch (e) {
            console.error('Error logging out:', e);
        }
    };

    window.changeTheme = function(themeValue: string) {
        if (themeValue === 'system') {
            localStorage.removeItem('cadiz_chat_theme');
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (typeof (window as any).applyTheme === 'function') {
                (window as any).applyTheme(isDark ? 'oscuro' : 'classic');
            }
        } else {
            if (typeof (window as any).applyTheme === 'function') {
                (window as any).applyTheme(themeValue === 'dark' ? 'oscuro' : 'classic');
            }
        }
    };

    window.openSettingsModal = function() {
        const dataMe = (window as any).dataMe;
        if (!dataMe || !dataMe.user) return;
        const modal = document.getElementById('settings-modal');
        if (modal) {
            const emailDisp = document.getElementById('settings-email-display');
            if (emailDisp) emailDisp.innerText = dataMe.user.email;
            
            const confirmEl = document.getElementById('delete-account-confirm');
            if (confirmEl) confirmEl.style.display = 'none';
            
            const errEl = document.getElementById('settings-error');
            if (errEl) errEl.style.display = 'none';
            
            const select = document.getElementById('settings-theme') as HTMLSelectElement;
            if (select) {
                const current = localStorage.getItem('cadiz_chat_theme');
                if (!current) select.value = 'system';
                else if (current === 'oscuro') select.value = 'dark';
                else select.value = 'light';
            }
            
            modal.style.display = 'flex';
        }
    };

    window.confirmDeleteAccount = function() {
        const confirmEl = document.getElementById('delete-account-confirm');
        if (confirmEl) confirmEl.style.display = 'block';
    };

    window.executeDeleteAccount = async function() {
        const btn = document.getElementById('delete-account-btn') as HTMLButtonElement;
        const errorEl = document.getElementById('settings-error');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Borrando...';
        }
        if (errorEl) errorEl.style.display = 'none';
        
        try {
            const res = await fetch('/api/users/delete-account', { method: 'DELETE' });
            if (res.ok) {
                window.location.reload();
            } else {
                const data = await res.json();
                if (errorEl) {
                    errorEl.innerText = data.error || 'Error al eliminar la cuenta.';
                    errorEl.style.display = 'block';
                }
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Sí, borrar todo';
                }
            }
        } catch (e) {
            if (errorEl) {
                errorEl.innerText = 'Error de conexión.';
                errorEl.style.display = 'block';
            }
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Sí, borrar todo';
            }
        }
    };

    window.openPublicProfile = async function(userId) {
        if (!userId) return;
        const modal = document.getElementById('public-profile-modal');
        if (!modal) return;
        
        // Show loading state or reset
        document.getElementById('public-profile-name').textContent = 'Cargando...';
        document.getElementById('public-profile-username').textContent = '';
        document.getElementById('public-profile-bio').textContent = '';
        document.getElementById('public-profile-category-badge').textContent = '';
        document.getElementById('public-profile-posts').textContent = '0';
        document.getElementById('public-profile-date').textContent = '...';
        document.getElementById('public-profile-avatar').src = 'https://ui-avatars.com/api/?name=...';
        document.getElementById('public-profile-dm-btn').style.display = 'none';
        
        const recentPostsContainer = document.getElementById('public-profile-recent-posts');
        if (recentPostsContainer) recentPostsContainer.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Cargando...</div>';
        
        modal.style.display = 'flex';

        try {
            // Fetch profile data
            const res = await fetch('/api/users/profile?id=' + encodeURIComponent(userId));
            const data = await res.json();
            
            if (data.success && data.profile) {
                const p = data.profile;
                document.getElementById('public-profile-name').textContent = p.name || 'Usuario';
                document.getElementById('public-profile-username').textContent = '@' + (p.username || 'usuario');
                document.getElementById('public-profile-bio').textContent = p.bio || 'Sin biografía';
                
                let badgeHtml = '';
                if (p.category === 'profesional') {
                    badgeHtml = `<span style="background: #3b82f6; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">GADITAN PROFESIONAL</span>`;
                } else if (p.category === 'local') {
                    badgeHtml = `<span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">LOCAL</span>`;
                } else if (p.category === 'turista') {
                    badgeHtml = `<span style="background: #f59e0b; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">TURISTA</span>`;
                }
                
                const verifiedBadge = document.getElementById('public-profile-verified-badge');
                if (p.verified) {
                    if (verifiedBadge) verifiedBadge.style.display = 'inline-flex';
                } else {
                    if (verifiedBadge) verifiedBadge.style.display = 'none';
                }
                
                const categoryBadge = document.getElementById('public-profile-category-badge');
                if (badgeHtml) {
                    categoryBadge.innerHTML = badgeHtml;
                    categoryBadge.style.display = 'inline-block';
                } else {
                    categoryBadge.style.display = 'none';
                }
                
                // Color banner depending on category
                const banner = document.getElementById('public-profile-banner');
                if (banner) {
                    if (p.category === 'local') banner.style.background = 'linear-gradient(135deg, #10b981, #3b82f6)';
                    else if (p.category === 'profesional') banner.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
                    else banner.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)'; // Turista or default
                }

                document.getElementById('public-profile-posts').textContent = p.posts_count || '0';
                
                if (p.created_at) {
                    const d = new Date(p.created_at);
                    document.getElementById('public-profile-date').textContent = d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                } else {
                    document.getElementById('public-profile-date').textContent = '';
                }

                document.getElementById('public-profile-avatar').src = p.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.name || '?');

                const dataMe = (window as any).dataMe;
                const myUserId = dataMe?.user?.id;
                
                if (myUserId === userId) {
                    document.getElementById('public-profile-cover-btn').style.display = 'flex';
                } else {
                    document.getElementById('public-profile-cover-btn').style.display = 'none';
                }
                
                if (myUserId && myUserId !== userId) {
                    // Check if DM is allowed
                    if (p.dm_privacy === 'nobody') {
                        document.getElementById('public-profile-dm-btn').style.display = 'none';
                    } else {
                        const dmBtn = document.getElementById('public-profile-dm-btn');
                        dmBtn.style.display = 'flex';
                        dmBtn.onclick = () => {
                            modal.style.display = 'none';
                            window.openDMChat(userId, p.name, p.avatar_url);
                        };
                    }
                }

                // Fetch recent posts
                fetch('/api/posts/list?limit=3&userId=' + encodeURIComponent(userId))
                    .then(r => r.json())
                    .then(postData => {
                        if (recentPostsContainer) {
                            if (!postData.posts || postData.posts.length === 0) {
                                recentPostsContainer.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Aún no hay publicaciones.</div>';
                            } else {
                                recentPostsContainer.innerHTML = '';
                                postData.posts.forEach(post => {
                                    const postDate = new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                                    
                                    const postDiv = document.createElement('div');
                                    postDiv.style.cssText = "background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px;";
                                    
                                    const dateSpan = document.createElement('span');
                                    dateSpan.style.cssText = "font-size: 12px; color: var(--text-secondary);";
                                    dateSpan.textContent = postDate;
                                    postDiv.appendChild(dateSpan);
                                    
                                    if (post.content) {
                                        const contentP = document.createElement('p');
                                        contentP.style.cssText = "font-size: 14px; color: var(--text-primary); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;";
                                        contentP.textContent = post.content;
                                        postDiv.appendChild(contentP);
                                    }

                                    if (post.image_url) {
                                        const img = document.createElement('img');
                                        img.src = post.image_url;
                                        img.style.cssText = "width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-top: 4px;";
                                        postDiv.appendChild(img);
                                    }

                                    recentPostsContainer.appendChild(postDiv);
                                });
                            }
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching user posts:", err);
                        if (recentPostsContainer) recentPostsContainer.innerHTML = '';
                    });

            } else {
                document.getElementById('public-profile-name').textContent = 'Usuario no encontrado';
            }
        } catch (e) {
            document.getElementById('public-profile-name').textContent = 'Error de conexión';
        }
    };

    // --- LOGICA DE MENSAJES DIRECTOS (DMs) ---

    // User Search Logic
    const userSearchInput = document.getElementById('user-search-input') as HTMLInputElement;
    const userSearchResults = document.getElementById('user-search-results');
    let userSearchTimeout;

    if (userSearchInput && userSearchResults) {
        // Hide results on outside click
        document.addEventListener('click', (e) => {
            if (!userSearchInput.contains(e.target as Node) && !userSearchResults.contains(e.target as Node)) {
                userSearchResults.style.display = 'none';
            }
        });

        userSearchInput.addEventListener('input', (e) => {
            const query = (e.target as HTMLInputElement).value.trim();
            if (query.length < 2) {
                userSearchResults.style.display = 'none';
                return;
            }

            clearTimeout(userSearchTimeout);
            userSearchTimeout = setTimeout(async () => {
                try {
                    const res = await fetch('/api/users/search?q=' + encodeURIComponent(query));
                    const data = await res.json();
                    
                    if (!data.users || data.users.length === 0) {
                        userSearchResults.innerHTML = '<div style="padding: 12px; color: var(--text-secondary); font-size: 14px; text-align: center;">No se encontraron usuarios.</div>';
                        userSearchResults.style.display = 'block';
                        return;
                    }

                    userSearchResults.innerHTML = '';
                    data.users.forEach(user => {
                        const div = document.createElement('div');
                        div.style.cssText = "padding: 12px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;";
                        div.onmouseover = () => div.style.background = 'var(--chat-bg)';
                        div.onmouseout = () => div.style.background = 'transparent';
                        
                        const img = document.createElement('img');
                        img.src = user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || '?');
                        img.style.cssText = "width: 32px; height: 32px; border-radius: 50%; object-fit: cover;";
                        
                        const infoDiv = document.createElement('div');
                        const nameDiv = document.createElement('div');
                        nameDiv.style.cssText = "font-weight: 600; color: var(--text-primary); font-size: 14px;";
                        nameDiv.textContent = user.name || 'Usuario';
                        
                        const userDiv = document.createElement('div');
                        userDiv.style.cssText = "font-size: 12px; color: var(--text-secondary);";
                        userDiv.textContent = '@' + (user.username || 'usuario');
                        
                        infoDiv.appendChild(nameDiv);
                        infoDiv.appendChild(userDiv);
                        div.appendChild(img);
                        div.appendChild(infoDiv);
                        
                        div.onclick = () => {
                            userSearchResults.style.display = 'none';
                            userSearchInput.value = '';
                            window.openDMChat(user.id, user.name, user.avatar_url);
                        };
                        
                        userSearchResults.appendChild(div);
                    });
                    userSearchResults.style.display = 'block';
                } catch (err) {
                    console.error("Search error", err);
                }
            }, 300);
        });
    }
    
    // --- LOGICA DE COMUNIDAD ---
    let communityUsers = [];
    let currentCategoryFilter = 'local';

    window.loadCommunity = async function() {
        const container = document.getElementById('comunidad-container');
        if (!container) return;

        try {
            if (communityUsers.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); margin-top: 20px;">Cargando usuarios...</div>';
                const res = await fetch('/api/users/directory');
                const data = await res.json();
                
                if (data.users) {
                    communityUsers = data.users;
                } else {
                    communityUsers = [];
                }
            }
            window.filterCommunity(currentCategoryFilter);
        } catch (err) {
            console.error("Error loading community:", err);
            container.innerHTML = '<div style="text-align: center; color: #ef4444; margin-top: 20px;">Error al cargar la comunidad.</div>';
        }
    };

    window.filterCommunity = function(category) {
        currentCategoryFilter = category;
        
        // Actualizar UI de botones
        ['local', 'turista', 'profesional'].forEach(cat => {
            const btn = document.getElementById('filter-' + cat);
            if (btn) {
                if (cat === category) {
                    btn.className = 'comunidad-filter active';
                    btn.style.background = 'var(--chat-bg)';
                    btn.style.color = 'var(--text-primary)';
                } else {
                    btn.className = 'comunidad-filter';
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--text-secondary)';
                }
            }
        });

        const container = document.getElementById('comunidad-container');
        if (!container) return;

        const filtered = communityUsers.filter(u => u.category === category);

        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No hay usuarios en esta categoría.</div>';
            return;
        }

        container.innerHTML = '';
        filtered.forEach(user => {
            const div = document.createElement('div');
            div.style.cssText = "background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;";
            div.onmouseover = () => div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            div.onmouseout = () => div.style.boxShadow = 'none';
            div.onclick = () => window.openPublicProfile(user.id);

            const img = document.createElement('img');
            img.src = user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || '?');
            img.style.cssText = "width: 56px; height: 56px; border-radius: 50%; object-fit: cover; flex-shrink: 0;";

            const infoDiv = document.createElement('div');
            infoDiv.style.cssText = "display: flex; flex-direction: column; gap: 4px; overflow: hidden; flex: 1;";

            const nameDiv = document.createElement('div');
            nameDiv.style.cssText = "font-weight: 600; color: var(--text-primary); font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
            nameDiv.textContent = user.name || 'Usuario';

            const userDiv = document.createElement('div');
            userDiv.style.cssText = "font-size: 13px; color: var(--primary-color); font-weight: 500;";
            userDiv.textContent = '@' + (user.username || 'usuario');

            const bioDiv = document.createElement('div');
            bioDiv.style.cssText = "font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;";
            bioDiv.textContent = user.bio || 'Sin descripción';

            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(userDiv);
            infoDiv.appendChild(bioDiv);

            div.appendChild(img);
            div.appendChild(infoDiv);

            container.appendChild(div);
        });
    };
    
    let activeDMChatUserId = null;
    let dmChatPollingInterval = null;

    window.loadDMsInbox = async function() {
        const container = document.getElementById('dms-inbox-container');
        if (!container) return;
        
        try {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); margin-top: 20px;">Cargando mensajes...</div>';
            const res = await fetch('/api/dms/conversations');
            const data = await res.json();
            
            if (!data.conversations || data.conversations.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No tienes mensajes directos.</div>';
                // Also hide the badge
                const badge = document.getElementById('dms-badge');
                if (badge) badge.style.display = 'none';
                return;
            }

            container.innerHTML = '';
            let totalUnread = 0;
            
            data.conversations.forEach(conv => {
                totalUnread += conv.unread_count;
                const div = document.createElement('div');
                div.style.cssText = "display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--header-bg); border: 1px solid var(--header-border); border-radius: 16px; cursor: pointer;";
                div.onclick = () => window.openDMChat(conv.user_id, conv.name, conv.avatar_url || 'https://ui-avatars.com/api/?name='+encodeURIComponent(conv.name));
                
                const img = document.createElement('img');
                img.src = conv.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conv.name);
                img.style.cssText = "width: 48px; height: 48px; border-radius: 50%; object-fit: cover;";
                
                const infoDiv = document.createElement('div');
                infoDiv.style.cssText = "flex: 1; min-width: 0; display: flex; flex-direction: column;";
                
                const topRow = document.createElement('div');
                topRow.style.cssText = "display: flex; justify-content: space-between; align-items: baseline;";
                
                const nameSpan = document.createElement('span');
                nameSpan.style.cssText = "font-weight: 600; color: var(--text-primary); font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
                nameSpan.textContent = conv.name;
                
                const dateSpan = document.createElement('span');
                dateSpan.style.cssText = "font-size: 11px; color: var(--text-secondary);";
                if (conv.last_message_date) {
                    const d = new Date(conv.last_message_date);
                    dateSpan.textContent = d.toLocaleDateString() === new Date().toLocaleDateString() ? d.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}) : d.toLocaleDateString();
                }
                
                topRow.appendChild(nameSpan);
                topRow.appendChild(dateSpan);
                
                const bottomRow = document.createElement('div');
                bottomRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-top: 4px;";
                
                const msgSpan = document.createElement('span');
                msgSpan.style.cssText = "font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
                msgSpan.textContent = conv.last_message || '📷 Imagen adjunta';
                
                bottomRow.appendChild(msgSpan);
                
                if (conv.unread_count > 0) {
                    const badge = document.createElement('div');
                    badge.style.cssText = "background: var(--primary-color); color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;";
                    badge.textContent = conv.unread_count;
                    bottomRow.appendChild(badge);
                    nameSpan.style.color = 'var(--primary-color)';
                }
                
                infoDiv.appendChild(topRow);
                infoDiv.appendChild(bottomRow);
                
                div.appendChild(img);
                div.appendChild(infoDiv);
                
                container.appendChild(div);
            });
            
            // Update global badge
            const badge = document.getElementById('dms-badge');
            if (badge) {
                if (totalUnread > 0) {
                    badge.textContent = totalUnread;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
            
        } catch (e) {
            container.innerHTML = '<div style="text-align: center; color: #ef4444; margin-top: 20px;">Error al cargar mensajes.</div>';
        }
    };

    window.openDMChat = function(userId, name, avatar) {
        activeDMChatUserId = userId;
        document.getElementById('dm-chat-modal').style.display = 'flex';
        document.getElementById('dm-chat-name').textContent = name;
        document.getElementById('dm-chat-avatar').src = avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
        document.getElementById('dm-chat-avatar').style.display = 'block';
        
        window.loadDMChatHistory();
        
        // Auto-poll every 5 seconds
        if (dmChatPollingInterval) clearInterval(dmChatPollingInterval);
        dmChatPollingInterval = setInterval(window.loadDMChatHistory, 5000);
    };

    window.closeDMChat = function() {
        activeDMChatUserId = null;
        if (dmChatPollingInterval) {
            clearInterval(dmChatPollingInterval);
            dmChatPollingInterval = null;
        }
        document.getElementById('dm-chat-modal').style.display = 'none';
        window.loadDMsInbox(); // Refresh inbox to update unread
    };

    window.loadDMChatHistory = async function() {
        if (!activeDMChatUserId) return;
        const container = document.getElementById('dm-messages-container');
        try {
            const res = await fetch(`/api/dms/history?userId=${activeDMChatUserId}`);
            const data = await res.json();
            if (!data.messages) return;
            
            container.innerHTML = '';
            const myUserId = (window as any).dataMe?.user?.id;
            
            data.messages.forEach(msg => {
                const isMe = msg.sender_id === myUserId;
                const div = document.createElement('div');
                div.style.cssText = `max-width: 80%; padding: 12px; border-radius: 16px; margin-bottom: 8px; align-self: ${isMe ? 'flex-end' : 'flex-start'}; background: ${isMe ? 'var(--primary-color)' : 'var(--chat-bg)'}; color: ${isMe ? 'white' : 'var(--text-primary)'}; border: ${isMe ? 'none' : '1px solid var(--border-color)'};`;
                
                if (msg.image_url) {
                    if (msg.image_url === '[Foto Efímera Vista]') {
                        const info = document.createElement('div');
                        info.style.cssText = "font-size: 12px; font-style: italic; opacity: 0.8; margin-bottom: 4px;";
                        info.textContent = "📷 Foto efímera (Vista)";
                        div.appendChild(info);
                    } else if (msg.is_view_once && !isMe) {
                        const viewBtn = document.createElement('button');
                        viewBtn.textContent = '👁️ Ver foto efímera';
                        viewBtn.style.cssText = "background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: inherit; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold;";
                        viewBtn.onclick = async () => {
                            // Show full screen modal
                            const overlay = document.createElement('div');
                            overlay.style.cssText = "position: fixed; inset: 0; background: black; z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column;";
                            
                            const img = document.createElement('img');
                            img.src = msg.image_url;
                            img.style.cssText = "max-width: 100%; max-height: 80%; object-fit: contain;";
                            
                            const closeBtn = document.createElement('button');
                            closeBtn.textContent = 'Cerrar y eliminar';
                            closeBtn.style.cssText = "margin-top: 20px; padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer;";
                            
                            overlay.appendChild(img);
                            overlay.appendChild(closeBtn);
                            document.body.appendChild(overlay);
                            
                            // Mark as viewed in DB immediately
                            fetch('/api/dms/view', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ messageId: msg.id })
                            });

                            closeBtn.onclick = () => {
                                document.body.removeChild(overlay);
                                window.loadDMChatHistory(); // Refresh to show [Vista]
                            };
                        };
                        div.appendChild(viewBtn);
                    } else {
                        const img = document.createElement('img');
                        img.src = msg.image_url;
                        img.style.cssText = "max-width: 100%; border-radius: 8px; margin-bottom: 8px;";
                        div.appendChild(img);
                        
                        if (msg.is_view_once && isMe) {
                            const lbl = document.createElement('div');
                            lbl.style.cssText = "font-size: 10px; opacity: 0.7; margin-bottom: 4px;";
                            lbl.textContent = msg.viewed_at ? "👀 Visto por destinatario" : "🔒 Foto efímera enviada";
                            div.appendChild(lbl);
                        }
                    }
                }
                
                if (msg.content) {
                    const txt = document.createElement('div');
                    txt.style.cssText = "font-size: 14px; line-height: 1.4; word-wrap: break-word;";
                    txt.textContent = msg.content;
                    div.appendChild(txt);
                }
                
                const time = document.createElement('div');
                time.style.cssText = "font-size: 10px; opacity: 0.6; text-align: right; margin-top: 4px;";
                const d = new Date(msg.created_at);
                time.textContent = d.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'});
                div.appendChild(time);
                
                container.appendChild(div);
            });
            
            // Scroll to bottom if user is at bottom? For simplicity, just scroll down on every load
            container.scrollTop = container.scrollHeight;
            
        } catch (e) {
            console.error(e);
        }
    };

    window.sendDMMessage = async function() {
        if (!activeDMChatUserId) return;
        const input = document.getElementById('dm-chat-input');
        const fileInput = document.getElementById('dm-image-upload');
        const isViewOnce = document.getElementById('dm-is-view-once').checked;
        const btn = document.getElementById('dm-send-btn');
        
        const content = input.value.trim();
        const file = fileInput.files[0];
        
        if (!content && !file) return;
        
        btn.disabled = true;
        btn.style.opacity = '0.5';
        
        const formData = new FormData();
        formData.append('receiverId', activeDMChatUserId);
        if (content) formData.append('content', content);
        if (file) formData.append('image', file);
        if (isViewOnce && file) formData.append('isViewOnce', 'true');
        
        try {
            const res = await fetch('/api/dms/send', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                input.value = '';
                fileInput.value = '';
                document.getElementById('dm-image-preview-container').style.display = 'none';
                window.loadDMChatHistory();
            } else {
                alert(data.error || 'Error al enviar');
            }
        } catch (e) {
            alert('Error de red');
        } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    };

    window.handleDMImageSelect = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('dm-image-preview').src = e.target.result;
                document.getElementById('dm-image-preview-container').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    };

    // Auto-load DMs on start if logged in (for badge)
    setTimeout(() => {
        if ((window as any).dataMe?.user) {
            window.loadDMsInbox();
            setInterval(window.loadDMsInbox, 15000); // Poll inbox every 15s
        }
    }, 2000);

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('public-profile-more-dropdown');
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        }
    });

    // Tipado global
    declare global {
        interface Window {
            sendToAI: (text: string) => void;
            initInlineMap: (lat: string, lon: string, msgId: string) => void;
            startLiveNavigation: (lat: string, lon: string, name: string) => void;
            exitLiveNavigation: () => void;
            openWeatherModal: () => void;
            closeWeatherModal: () => void;
            logout: () => void;
            changeTheme: (theme: string) => void;
            openSettingsModal: () => void;
            confirmDeleteAccount: () => void;
            executeDeleteAccount: () => void;

            L: any;
        }
    }
