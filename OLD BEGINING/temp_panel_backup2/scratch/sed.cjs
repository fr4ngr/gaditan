const fs = require('fs');

let content = fs.readFileSync('public/js/mapManager.js', 'utf-8');

// Fix TestModeControl
const testModeRegex = /        \/\/ Control para Modo Prueba \(Simulador GPS\)\r?\n        const TestModeControl = L\.Control\.extend\(\{[\s\S]*?\}\);\r?\n        new TestModeControl\(\)\.addTo\(map\);/;
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
                
                testMarker.on('drag', () => {
                    geoService.triggerWatch();
                });
                
                alert("Modo Prueba Activado. Arrastra el marcador rojo para simular que caminas por Cádiz.");
                
            } else {
                btnTestMode.style.background = 'rgba(245, 158, 11, 0.9)';
                btnTestMode.style.borderColor = '#d97706';
                btnTestMode.innerHTML = \`<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px;">MODO PRUEBA</span>\`;
                
                if (testMarker) {
                    testMarker.remove();
                    testMarker = null;
                }
                alert("Modo Prueba Desactivado.");
            }
        });`;

content = content.replace(testModeRegex, newTestMode);

// Fix L.latLngBounds
const boundsRegex = /const bounds = L\.latLngBounds\(\[\r?\n\s*\[lat, lon\],\r?\n\s*\[masCercana\.lat, masCercana\.lon\]\r?\n\s*\]\);/;
const newBounds = `const bounds = new maplibregl.LngLatBounds();
                    bounds.extend([lon, lat]);
                    bounds.extend([masCercana.lon, masCercana.lat]);`;
content = content.replace(boundsRegex, newBounds);

fs.writeFileSync('public/js/mapManager.js', content, 'utf-8');
