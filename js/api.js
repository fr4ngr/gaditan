// js/api.js

export async function getOSRMRoute(originCoords, destCoords) {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=simplified&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok') throw new Error("OSRM Routing Error");
    return {
        distanceKm: data.routes[0].distance / 1000,
        durationMin: Math.ceil(data.routes[0].duration / 60),
        geometry: data.routes[0].geometry
    };
}

export async function getExactCoordinate(baseObj, numberStr) {
    if (!numberStr || numberStr.trim() === '') return baseObj;
    try {
        const query = encodeURIComponent(`${baseObj.name} ${numberStr}, ${baseObj.city}`);
        const url = `https://photon.komoot.io/api/?q=${query}&lat=${baseObj.lat}&lon=${baseObj.lon}&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.features && data.features.length > 0) {
            const baseNameWords = baseObj.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                  .replace(/\b(calle|avenida|plaza|glorieta|paseo|de|la|los|las|el)\b/g, "")
                                  .split(" ").filter(w => w.trim().length > 2);
            
            let bestFeature = null;
            for (let feature of data.features) {
                const streetName = (feature.properties.street || feature.properties.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                let hasMatch = false;
                if (baseNameWords.length === 0) {
                    hasMatch = true;
                } else {
                    hasMatch = baseNameWords.some(w => streetName.includes(w));
                }
                
                if (hasMatch) {
                    bestFeature = feature;
                    break;
                }
            }
            
            if (bestFeature) {
                const newLat = bestFeature.geometry.coordinates[1];
                const newLon = bestFeature.geometry.coordinates[0];
                
                const dLat = (newLat - baseObj.lat) * 111;
                const dLon = (newLon - baseObj.lon) * 89;
                const distanceKm = Math.sqrt(dLat*dLat + dLon*dLon);
                
                if (distanceKm < 1.5) {
                    return { ...baseObj, lat: newLat, lon: newLon };
                }
            }
        }
    } catch(e) {
        console.error("Error in getExactCoordinate:", e);
    }
    return baseObj; 
}

export async function geocodeString(query, strictCadiz = false) {
    try {
        let url = "https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=36.52&lon=-6.29&limit=1";
        if (strictCadiz) {
            url += "&bbox=-6.32,36.48,-6.25,36.54";
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            return {
                name: props.name || props.street || query,
                city: props.city || props.town || props.village || 'Cádiz',
                lat: data.features[0].geometry.coordinates[1],
                lon: data.features[0].geometry.coordinates[0]
            };
        }
    } catch(e) {
        console.error(e);
    }
    return null;
}
