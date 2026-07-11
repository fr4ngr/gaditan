const fs = require('fs');
let content = fs.readFileSync('public/js/mapManager.js', 'utf-8');

// 1. Fix typeof L === 'undefined'
content = content.replace("typeof L === 'undefined'", "typeof maplibregl === 'undefined'");

// 2. Fix map.easeTo premature execution
content = content.replace("if (map) map.easeTo({ pitch: 0, bearing: 0 });", "if (map && map.isStyleLoaded()) map.easeTo({ pitch: 0, bearing: 0 });");

// 3. Fix TestModeControl
const oldTestMode = `        // Control para Modo Prueba (Simulador GPS)
        const TestModeControl = L.Control.extend({
            options: { position: 'topright' },
            onAdd: function() {
                const btn = L.DomUtil.create('button', 'map-test-btn');
                btn.title = 'Activar/Desactivar Simulador GPS';
                btn.innerHTML = \`<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">MODO PRUEBA</span>\`;
                btn.style.cssText = \`
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
                \`;
                L.DomEvent.on(btn, 'click', L.DomEvent.stopPropagation);
                L.DomEvent.on(btn, 'click', () => {
                    testMode = !testMode;
                    if (testMode) {
                        btn.style.background = '#ef4444';
                        btn.style.borderColor = '#b91c1c';
                        btn.innerHTML = \`<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">PRUEBA ACTIVA</span>\`;
                        
                        map.setView([36.529, -6.292], 16);
                        
                        const testIcon = createCustomIconObj({
                            className: 'test-user-icon',
                            html: \`<div style="background:#ef4444; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div><div style="position:absolute; top:-25px; left:-40px; background:#ef4444; color:white; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold; white-space:nowrap;">Tú (Simulado)</div>\`,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        
                        const el = document.createElement('div'); el.innerHTML = testIcon.options.html; el.className = testIcon.options.className; testMarker = new maplibregl.Marker({ element: el, draggable: true }).setLngLat([-6.292, 36.529]).addTo(map);
                        
                        testMarker.on('drag', () => {
                            geoService.triggerWatch();
                        });
                        
                        alert("Modo Prueba Activado. Arrastra el marcador rojo para simular que caminas por Cádiz.");
                        
                    } else {
                        btn.style.background = 'rgba(245, 158, 11, 0.9)';
                        btn.style.borderColor = '#d97706';
                        btn.innerHTML = \`<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">MODO PRUEBA</span>\`;
                        
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
        new TestModeControl().addTo(map);`;

const newTestMode = `        // Control para Modo Prueba (Simulador GPS)
        const btnTestMode = document.createElement('button');
        btnTestMode.title = 'Activar/Desactivar Simulador GPS';
        btnTestMode.innerHTML = \`<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">MODO PRUEBA</span>\`;
        btnTestMode.style.cssText = \`
            position: absolute;
            top: 10px;
            right: 60px;
            z-index: 1000;
            background: rgba(245, 158, 11, 0.9);
            border: 2px solid #d97706;
            border-radius: 8px;
            padding: 0.4rem 0.8rem;
            color: white;
            cursor: pointer;
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4);
            transition: all 0.2s;
        \`;
        document.getElementById('map').appendChild(btnTestMode);
        btnTestMode.addEventListener('mousedown', e => e.stopPropagation());
        btnTestMode.addEventListener('touchstart', e => e.stopPropagation(), {passive: false});
        btnTestMode.addEventListener('click', (e) => {
            e.stopPropagation();
            testMode = !testMode;
            if (testMode) {
                btnTestMode.style.background = '#ef4444';
                btnTestMode.style.borderColor = '#b91c1c';
                btnTestMode.innerHTML = \`<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">PRUEBA ACTIVA</span>\`;
                map.flyTo({ center: [-6.292, 36.529], zoom: 16 });
                const testIcon = createCustomIconObj({
                    className: 'test-user-icon',
                    html: \`<div style="background:#ef4444; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div><div style="position:absolute; top:-25px; left:-40px; background:#ef4444; color:white; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold; white-space:nowrap;">Tú (Simulado)</div>\`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                const el = document.createElement('div'); el.innerHTML = testIcon.options.html; el.className = testIcon.options.className; testMarker = new maplibregl.Marker({ element: el, draggable: true }).setLngLat([-6.292, 36.529]).addTo(map);
                testMarker.on('drag', () => { geoService.triggerWatch(); });
                alert("Modo Prueba Activado. Arrastra el marcador rojo para simular que caminas por Cádiz.");
            } else {
                btnTestMode.style.background = 'rgba(245, 158, 11, 0.9)';
                btnTestMode.style.borderColor = '#d97706';
                btnTestMode.innerHTML = \`<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">MODO PRUEBA</span>\`;
                if (testMarker) { testMarker.remove(); testMarker = null; }
                alert("Modo Prueba Desactivado.");
            }
        });`;

content = content.replace(oldTestMode, newTestMode);

// 4. routePolyline
content = content.replace(
    /routePolyline = L\.polyline\(coordinates, \{[\s\S]*?\}\)\.addTo\(map\);/g,
    `const geojson = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coordinates.map(c => [c[1], c[0]]) } };
            if (map.getSource(routePolylineId)) {
                map.getSource(routePolylineId).setData(geojson);
            } else {
                map.addSource(routePolylineId, { type: 'geojson', data: geojson });
                map.addLayer({ id: routePolylineId, type: 'line', source: routePolylineId, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#3b82f6', 'line-width': 6, 'line-opacity': 0.8 } });
            }`
);

// 5. L.latLngBounds
content = content.replace(
    /const bounds = L\.latLngBounds\(\[\n\s*\[lat, lon\],\n\s*\[masCercana\.lat, masCercana\.lon\]\n\s*\]\);/g,
    `const bounds = new maplibregl.LngLatBounds();
                    bounds.extend([lon, lat]);
                    bounds.extend([masCercana.lon, masCercana.lat]);`
);

content = content.replace(
    /map\.flyToBounds\(bounds, \{ paddingTopLeft: \[20, 180\], paddingBottomRight: \[20, 20\], animate: true, duration: 1\.2, easeLinearity: 0\.25 \}\);/g,
    `map.fitBounds(bounds, { padding: {top: 180, left: 20, bottom: 20, right: 20}, duration: 1200 });`
);

// 6. Any other L.latLngBounds?
content = content.replace(
    /const bounds = L\.latLngBounds\((.*?)\);/g,
    `const bounds = new maplibregl.LngLatBounds(); $1.forEach(c => bounds.extend([c[1], c[0]]));`
);

fs.writeFileSync('public/js/mapManager.js', content, 'utf-8');
console.log("Fix script finished!");
