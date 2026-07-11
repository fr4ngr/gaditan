const fs = require('fs');

let content = fs.readFileSync('public/js/mapManager.js', 'utf-8');

// 1. Variables at the top
content = content.replace(
    "    let map = null;\n    let markersLayer = null;\n    let userMarker = null;\n    let routePolyline = null;",
    "    let map = null;\n    let markers = [];\n    let poiMarkers = [];\n    let routePolylineId = 'route-line';\n    let userMarker = null;"
);

// 2. Init MapLibre
content = content.replace(
    /map = L\.map\('map', \{[\s\S]*?\}\)\.setView\(\[36\.529, -6\.292\], 13\);[\s\S]*?L\.tileLayer\('https:\/\/\{s\}\.basemaps\.cartocdn\.com\/rastertiles\/voyager\/\{z\}\/\{x\}\/\{y\}\{r\}\.png', \{[\s\S]*?\}\)\.addTo\(map\);[\s\S]*?markersLayer = L\.layerGroup\(\)\.addTo\(map\);\s*poiLayer = L\.layerGroup\(\)\.addTo\(map\);/g,
    `map = new maplibregl.Map({
            container: 'map',
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [-6.2925, 36.5271],
            zoom: 13,
            attributionControl: false
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        
        const satBtn = document.createElement('button');
        satBtn.id = 'btn-satellite-toggle';
        satBtn.innerHTML = '<i data-lucide="satellite"></i>';
        satBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 1000; background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #333; box-shadow: 0 2px 6px rgba(0,0,0,0.3);';
        
        let isSatellite = false;
        satBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isSatellite = !isSatellite;
            if (isSatellite) {
                map.setLayoutProperty('satellite-layer', 'visibility', 'visible');
                satBtn.style.background = '#06b6d4';
                satBtn.style.color = 'white';
            } else {
                map.setLayoutProperty('satellite-layer', 'visibility', 'none');
                satBtn.style.background = 'white';
                satBtn.style.color = '#333';
            }
        });
        
        map.on('load', () => {
            document.getElementById('map').appendChild(satBtn);
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            map.addSource('satellite', {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256
            });
            
            const layers = map.getStyle().layers;
            let firstSymbolId;
            for (let i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol') {
                    firstSymbolId = layers[i].id;
                    break;
                }
            }
            
            map.addLayer({
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite',
                layout: { visibility: 'none' }
            }, firstSymbolId);
        });
        
        markers = [];
        poiMarkers = [];`);

// Event propagations
content = content.replace(
    /if \(typeof L !== 'undefined'\) \{\s*L\.DomEvent\.disableClickPropagation\(customControls\);\s*\}/g,
    "customControls.addEventListener('wheel', e => e.stopPropagation());\n            customControls.addEventListener('mousedown', e => e.stopPropagation());\n            customControls.addEventListener('touchstart', e => e.stopPropagation(), {passive: false});"
);

content = content.replace(
    /if \(typeof L !== 'undefined'\) \{\s*L\.DomEvent\.disableClickPropagation\(topControls\);\s*\}/g,
    "topControls.addEventListener('wheel', e => e.stopPropagation());\n                topControls.addEventListener('mousedown', e => e.stopPropagation());\n                topControls.addEventListener('touchstart', e => e.stopPropagation(), {passive: false});"
);

content = content.replace(/poiLayer\.clearLayers\(\);/g, "poiMarkers.forEach(m => m.remove()); poiMarkers = [];");
content = content.replace(/markersLayer\.clearLayers\(\);/g, "markers.forEach(m => m.remove()); markers = [];");

const helper = "    const createCustomIconObj = (options) => { return { options }; };\n";
content = content.replace("const init = () => {", helper + "    const init = () => {");
content = content.replace(/L\.divIcon/g, "createCustomIconObj");

content = content.replace(
    /const marker = L\.marker\(\[p\.lat, p\.lon\], \{ icon: currentMarkerIcon \}\)\.addTo\(markersLayer\);/g,
    "const el = document.createElement('div');\n            el.innerHTML = currentMarkerIcon.options.html;\n            if (currentMarkerIcon.options.className) el.className = currentMarkerIcon.options.className;\n            const marker = new maplibregl.Marker({ element: el })\n                .setLngLat([p.lon, p.lat])\n                .addTo(map);\n            markers.push(marker);"
);

content = content.replace(
    /const marker = L\.marker\(\[poi\.lat, poi\.lon\], \{ icon: currentIcon \}\)\.addTo\(poiLayer\);/g,
    "const el = document.createElement('div');\n            el.innerHTML = currentIcon.options.html;\n            if (currentIcon.options.className) el.className = currentIcon.options.className;\n            const marker = new maplibregl.Marker({ element: el })\n                .setLngLat([poi.lon, poi.lat])\n                .addTo(map);\n            poiMarkers.push(marker);"
);

content = content.replace(
    /userMarker = L\.marker\(\[(uLat|lat), (uLon|lon)\], \{ icon: userIcon \}\)\.addTo\(map\);/g,
    (match, p1, p2) => `const el = document.createElement('div');\n                    el.innerHTML = userIcon.options.html;\n                    if (userIcon.options.className) el.className = userIcon.options.className;\n                    userMarker = new maplibregl.Marker({ element: el })\n                        .setLngLat([${p2}, ${p1}])\n                        .addTo(map);`
);

content = content.replace(/userMarker\.setLatLng\(\[(.*?), (.*?)\]\);/g, "userMarker.setLngLat([$2, $1]);");

content = content.replace(
    /testMarker = L\.marker\(\[36\.529, -6\.292\], \{ icon: testIcon, draggable: true, zIndexOffset: 1000 \}\)\.addTo\(map\);/g,
    "const el = document.createElement('div'); el.innerHTML = testIcon.options.html; el.className = testIcon.options.className; testMarker = new maplibregl.Marker({ element: el, draggable: true }).setLngLat([-6.292, 36.529]).addTo(map);"
);

content = content.replace(
    /const bounds = L\.latLngBounds\((.*?)\);/g,
    "const bounds = new maplibregl.LngLatBounds();\n                    $1.forEach(c => bounds.extend([c[1], c[0]]));"
);

content = content.replace(
    /const bounds = L\.latLngBounds\(\[\n\s*\[lat, lon\],\n\s*\[masCercana\.lat, masCercana\.lon\]\n\s*\]\);/g,
    "const bounds = new maplibregl.LngLatBounds();\\n                    bounds.extend([lon, lat]);\\n                    bounds.extend([masCercana.lon, masCercana.lat]);"
);

content = content.replace(
    /map\.flyToBounds\(\[\[(.*?), (.*?)\], \[(.*?), (.*?)\]\], \{ maxZoom: 17, paddingTopLeft: \[(.*?), (.*?)\] \}\);/g,
    "map.fitBounds([[$2, $1], [$4, $3]], { maxZoom: 17, padding: { top: $6, left: $5, bottom: 20, right: 20 }, animate: true });"
);

content = content.replace(
    /map\.flyToBounds\(\[\[(.*?), (.*?)\], \[(.*?), (.*?)\]\], \{ maxZoom: 17, padding: \[(.*?), (.*?)\] \}\);/g,
    "map.fitBounds([[$2, $1], [$4, $3]], { maxZoom: 17, padding: { top: $5, left: $5, bottom: $6, right: $6 }, animate: true });"
);

content = content.replace(
    /const bounds = new maplibregl\.LngLatBounds\(\);\n\s*\[\n\s*\[lat, lon\],\n\s*\[masCercana\.lat, masCercana\.lon\]\n\s*\]\);/g,
    "const bounds = new maplibregl.LngLatBounds();\nbounds.extend([lon, lat]);\nbounds.extend([masCercana.lon, masCercana.lat]);"
);

content = content.replace(
    /map\.flyToBounds\(bounds, \{ paddingTopLeft: \[20, 180\], paddingBottomRight: \[20, 20\], animate: true, duration: 1\.2, easeLinearity: 0\.25 \}\);/g,
    "map.fitBounds(bounds, { padding: {top: 180, left: 20, bottom: 20, right: 20}, duration: 1200 });"
);

const bearing_func = `    const calculateBearing = (lat1, lon1, lat2, lon2) => {
        const toRad = Math.PI / 180;
        const toDeg = 180 / Math.PI;
        const dLon = (lon2 - lon1) * toRad;
        const y = Math.sin(dLon) * Math.cos(lat2 * toRad);
        const x = Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
                  Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos(dLon);
        let brng = Math.atan2(y, x) * toDeg;
        return (brng + 360) % 360;
    };
    
    const startNavigation`;
content = content.replace("    const startNavigation", bearing_func);

content = content.replace(
    `                            if (heading !== null && !isNaN(heading)) {
                                wrapper.style.transform = \`rotate(\${heading}deg)\`;
                                arrow.style.opacity = '1';
                            } else {
                                arrow.style.opacity = '0';
                            }`,
    `                            wrapper.style.transform = \`rotate(0deg)\`;
                            arrow.style.opacity = '1';`
);

content = content.replace(
    `                map.fitBounds([[uLat, uLon], [uLat, uLon]], { maxZoom: 18, paddingBottomRight: [0, 150], animate: true });`,
    `                let targetBearing = 0;
                if (heading !== null && !isNaN(heading)) {
                    targetBearing = heading;
                } else if (typeof navCurrentRouteLine !== 'undefined' && navCurrentRouteLine.length > 1) {
                    targetBearing = calculateBearing(uLat, uLon, navCurrentRouteLine[1][0], navCurrentRouteLine[1][1]);
                }
                
                map.easeTo({
                    center: [uLon, uLat],
                    zoom: 18,
                    pitch: 60,
                    bearing: targetBearing,
                    padding: { bottom: 150 }
                });`
);

content = content.replace(
    /if \(routePolyline\) \{\s*map\.removeLayer\(routePolyline\);\s*routePolyline = null;\s*\}/g,
    "if (map.getSource(routePolylineId)) { map.removeLayer(routePolylineId); map.removeSource(routePolylineId); }"
);

content = content.replace(
    /routePolyline = L\.polyline\(coordinates, \{\s*color: '#06b6d4',\s*weight: 5,\s*opacity: 0\.8,\s*lineJoin: 'round'\s*\}\)\.addTo\(map\);/g,
    "const routeGeoJSON = { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': coordinates.map(c => [c[1], c[0]]) } }; map.addSource(routePolylineId, { 'type': 'geojson', 'data': routeGeoJSON }); map.addLayer({ 'id': routePolylineId, 'type': 'line', 'source': routePolylineId, 'layout': { 'line-join': 'round', 'line-cap': 'round' }, 'paint': { 'line-color': '#06b6d4', 'line-width': 5 } });"
);

content = content.replace(
    /if \(!isNavigating\) \{\s*map\.fitBounds\(routePolyline\.getBounds\(\), \{\s*paddingTopLeft: \[20, 200\],\s*paddingBottomRight: \[20, 20\],\s*animate: true\s*\}\);\s*\}/g,
    "if (!isNavigating) { const bounds = new maplibregl.LngLatBounds(); coordinates.forEach(c => bounds.extend([c[1], c[0]])); map.fitBounds(bounds, { padding: {top: 200, bottom: 20, left: 20, right: 20}, animate: true }); }"
);

content = content.replace(
    /targetDestParada = null;\n        \} else if \(mode === 'cercana'\)/g,
    "targetDestParada = null;\n            if (map) map.easeTo({ pitch: 0, bearing: 0 });\n        } else if (mode === 'cercana')"
);

fs.writeFileSync('public/js/mapManager.js', content, 'utf-8');
console.log("done");
