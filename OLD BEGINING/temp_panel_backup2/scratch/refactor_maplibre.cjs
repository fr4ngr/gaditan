const fs = require('fs');

const file = 'public/js/mapManager.js';
let content = fs.readFileSync(file, 'utf8');

// Replace L.map
content = content.replace(/map = L\.map\('map', \{[\s\S]*?\}\);/, `map = new maplibregl.Map({
            container: 'map',
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [-6.2925, 36.5271],
            zoom: 13,
            attributionControl: false
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');`);

// Replace LayerGroups
content = content.replace(/markersLayer = L\.layerGroup\(\)\.addTo\(map\);/, 'markers = [];');
content = content.replace(/poiLayer = L\.layerGroup\(\)\.addTo\(map\);/, 'poiMarkers = [];');

// Add markers array to top
content = content.replace(/let map, markersLayer, poiLayer, routePolyline, userMarker;/, 'let map, markers = [], poiMarkers = [], routePolylineId = "route-line", userMarker;');

// Replace clearLayers
content = content.replace(/markersLayer\.clearLayers\(\);/g, 'markers.forEach(m => m.remove()); markers = [];');
content = content.replace(/poiLayer\.clearLayers\(\);/g, 'poiMarkers.forEach(m => m.remove()); poiMarkers = [];');

// Replace disableClickPropagation
content = content.replace(/if \(typeof L !== 'undefined'\) \{[\s\S]*?L\.DomEvent\.disableClickPropagation\(customControls\);[\s\S]*?\}/g, `customControls.addEventListener('wheel', e => e.stopPropagation());
            customControls.addEventListener('mousedown', e => e.stopPropagation());
            customControls.addEventListener('touchstart', e => e.stopPropagation(), {passive: false});`);
            
content = content.replace(/if \(typeof L !== 'undefined'\) \{[\s\S]*?L\.DomEvent\.disableClickPropagation\(topControls\);[\s\S]*?\}/g, `topControls.addEventListener('wheel', e => e.stopPropagation());
            topControls.addEventListener('mousedown', e => e.stopPropagation());
            topControls.addEventListener('touchstart', e => e.stopPropagation(), {passive: false});`);

// Fix markers initialization
// old: const marker = L.marker([p.lat, p.lon], { icon: currentMarkerIcon }).addTo(markersLayer);
content = content.replace(/const marker = L\.marker\(\[p\.lat, p\.lon\], \{ icon: currentMarkerIcon \}\)\.addTo\(markersLayer\);/g, 
`const el = document.createElement('div');
            el.innerHTML = currentMarkerIcon.options.html;
            if (currentMarkerIcon.options.className) el.className = currentMarkerIcon.options.className;
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([p.lon, p.lat])
                .addTo(map);
            markers.push(marker);`);

// POI marker
content = content.replace(/const marker = L\.marker\(\[poi\.lat, poi\.lon\], \{ icon: currentIcon \}\)\.addTo\(poiLayer\);/g, 
`const el = document.createElement('div');
            el.innerHTML = currentIcon.options.html;
            if (currentIcon.options.className) el.className = currentIcon.options.className;
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([poi.lon, poi.lat])
                .addTo(map);
            poiMarkers.push(marker);`);

// L.divIcon
content = content.replace(/L\.divIcon/g, 'createCustomIconObj');

// We need to inject createCustomIconObj helper
const helperStr = `
    const createCustomIconObj = (options) => {
        return { options };
    };
    
`;
content = content.replace('const init = () => {', helperStr + 'const init = () => {');

// Fly to bounds [p.lat, p.lon], [p.lat, p.lon]
content = content.replace(/map\.flyToBounds\(\[\[(.*?), (.*?)\], \[(.*?), (.*?)\]\], \{ maxZoom: 17, paddingTopLeft: \[(.*?), (.*?)\] \}\);/g,
    `map.fitBounds([[$2, $1], [$4, $3]], { maxZoom: 17, padding: { top: $6, left: $5, bottom: 20, right: 20 }, animate: true });`);

content = content.replace(/map\.flyToBounds\(\[\[(.*?), (.*?)\], \[(.*?), (.*?)\]\], \{ maxZoom: 17, padding: \[(.*?), (.*?)\] \}\);/g,
    `map.fitBounds([[$2, $1], [$4, $3]], { maxZoom: 17, padding: { top: $5, left: $5, bottom: $6, right: $6 }, animate: true });`);

// fitBounds logic in click
content = content.replace(/map\.fitBounds\(routePolyline\.getBounds\(\), \{ paddingTopLeft: \[(.*?), (.*?)\], paddingBottomRight: \[(.*?), (.*?)\], animate: true \}\);/g,
    `// fit bounds to route manually later or use bbox`); // We will fix this manually later.

// Route polyline logic
content = content.replace(/if \(routePolyline\) \{[\s\S]*?routePolyline = null;\s*\}/g, 
`if (map.getSource(routePolylineId)) {
            map.removeLayer(routePolylineId);
            map.removeSource(routePolylineId);
        }`);

content = content.replace(/routePolyline = L\.polyline\(coordinates, \{[\s\S]*?\}\)\.addTo\(map\);/g, 
`const routeGeoJSON = {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates.map(c => [c[1], c[0]])
                }
            };
            map.addSource(routePolylineId, { 'type': 'geojson', 'data': routeGeoJSON });
            map.addLayer({
                'id': routePolylineId,
                'type': 'line',
                'source': routePolylineId,
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': '#06b6d4', 'line-width': 4 }
            });`);

content = content.replace(/const bounds = L\.latLngBounds\(coordinates\);[\s\S]*?map\.fitBounds\(bounds, \{ paddingTopLeft: \[(.*?)\], paddingBottomRight: \[(.*?)\], animate: true \}\);/g, 
`const bounds = new maplibregl.LngLatBounds();
            coordinates.forEach(c => bounds.extend([c[1], c[0]]));
            map.fitBounds(bounds, { padding: {top: $1[1] || 20, left: $1[0] || 20, bottom: $2[1] || 20, right: $2[0] || 20}, animate: true });`);

// L.latLngBounds
content = content.replace(/const bounds = L\.latLngBounds\((.*?)\);/g, 
`const bounds = new maplibregl.LngLatBounds();
                    $1.forEach(c => bounds.extend([c[1], c[0]]));`);
                    
content = content.replace(/map\.flyToBounds\(bounds, \{ paddingTopLeft: \[(.*?)\], paddingBottomRight: \[(.*?)\], animate: true, duration: 1\.2, easeLinearity: 0\.25 \}\);/g, 
`map.fitBounds(bounds, { padding: {top: $1[1] || 20, left: $1[0] || 20, bottom: $2[1] || 20, right: $2[0] || 20}, duration: 1200 });`);

// User Marker
content = content.replace(/userMarker = L\.marker\(\[(.*?), (.*?)\], \{ icon: userIcon \}\)\.addTo\(map\);/g,
`const el = document.createElement('div');
                    el.innerHTML = userIcon.options.html;
                    if (userIcon.options.className) el.className = userIcon.options.className;
                    userMarker = new maplibregl.Marker({ element: el })
                        .setLngLat([$2, $1])
                        .addTo(map);`);
                        
content = content.replace(/userMarker\.setLatLng\(\[(.*?), (.*?)\]\);/g, 'userMarker.setLngLat([$2, $1]);');
content = content.replace(/const el = userMarker\.getElement\(\);/g, 'const el = userMarker.getElement();');


fs.writeFileSync(file, content);
console.log('Refactor script completed');
