export async function onRequest(context) {
    const { env, request } = context;
    const aemetKey = env.AEMET_API_KEY;

    if (!aemetKey) {
        return new Response(JSON.stringify({ error: "Missing AEMET API KEY" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    const cacheUrl = new URL(request.url);
    cacheUrl.search = ""; // Ignorar parámetros de búsqueda
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    let cachedResponse = null;
    try {
        cachedResponse = await cache.match(cacheKey);
    } catch (e) {
        console.error("Cache match error:", e);
    }

    const fetchAndCache = async () => {
        try {
            // Fetch AEMET Diaria (Max/Min temps, UV)
            const diariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/11012/?api_key=${aemetKey}`);
            const diariaJson = await diariaRes.json();
            
            let dailyData = null;
            let dDataArr = null;
            if (diariaJson.estado == 200 && diariaJson.datos) {
                const dataRes = await fetch(diariaJson.datos);
                dDataArr = await dataRes.json();
                dailyData = dDataArr[0].prediccion.dia[0]; // Today
            }

            // Fetch AEMET Horaria (Current temp, sky)
            const horariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/11012/?api_key=${aemetKey}`);
            const horariaJson = await horariaRes.json();
            
            let hourlyData = null;
            if (horariaJson.estado == 200 && horariaJson.datos) {
                const hDataRes = await fetch(horariaJson.datos);
                const hDataArr = await hDataRes.json();
                hourlyData = hDataArr[0].prediccion.dia[0]; // Today
            }

            // Fetch Tides from IHM (ID 42 = Cadiz)
            let tidesData = null;
            try {
                const tidesRes = await fetch(`https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=42&format=json`);
                if (tidesRes.ok) {
                    const tidesJson = await tidesRes.json();
                    if (tidesJson && tidesJson.mareas && tidesJson.mareas.datos) {
                        tidesData = tidesJson.mareas.datos.marea;
                    }
                }
            } catch (e) {
                console.error("Error fetching tides:", e);
            }

            let currentTemp = "N/A";
            let currentSky = "N/A";
            let currentSkyDesc = "";
            let currentWindDir = "N/A";
            let currentWindSpeed = "N/A";
            let tMax = "N/A";
            let tMin = "N/A";
            let uvMax = "N/A";
            let tMaxTime = "N/A";
            let tMinTime = "N/A";

            if (dailyData) {
                if (dailyData.temperatura) {
                    tMax = dailyData.temperatura.maxima;
                    tMin = dailyData.temperatura.minima;
                }
                if (dailyData.uvMax !== undefined) {
                    uvMax = dailyData.uvMax;
                } else if (diariaJson && diariaJson.datos && dDataArr) {
                    const tomorrow = dDataArr[0].prediccion?.dia[1];
                    if (tomorrow && tomorrow.uvMax !== undefined) {
                        uvMax = tomorrow.uvMax;
                    }
                }
            }

            if (hourlyData) {
                if (hourlyData.temperatura && hourlyData.temperatura.length > 0) {
                    currentTemp = hourlyData.temperatura[0].value;
                    let maxFound = -999;
                    let minFound = 999;
                    hourlyData.temperatura.forEach(t => {
                        let v = parseInt(t.value);
                        let hourNum = parseInt(t.periodo, 10);
                        if (v > maxFound) { maxFound = v; tMaxTime = hourNum + ":00h"; }
                        if (v < minFound) { minFound = v; tMinTime = hourNum + ":00h"; }
                    });
                }
                if (hourlyData.estadoCielo && hourlyData.estadoCielo.length > 0) {
                    currentSky = hourlyData.estadoCielo[0].value;
                    currentSkyDesc = hourlyData.estadoCielo[0].descripcion;
                }
                if (hourlyData.vientoAndRachaMax && hourlyData.vientoAndRachaMax.length > 0) {
                    const windObj = hourlyData.vientoAndRachaMax.find(v => v.direccion && v.velocidad);
                    if (windObj) {
                        currentWindDir = windObj.direccion[0];
                        currentWindSpeed = windObj.velocidad[0];
                    }
                }
            }

            const formattedTides = [];
            if (tidesData && Array.isArray(tidesData)) {
                tidesData.forEach(t => {
                    formattedTides.push({
                        type: t.tipo.toLowerCase(),
                        time: t.hora,
                        height: t.altura
                    });
                });
            }

            const responseData = {
                location: "Cádiz",
                current: { temp: currentTemp, sky: currentSky, skyDesc: currentSkyDesc, windDir: currentWindDir, windSpeed: currentWindSpeed },
                daily: { tempMax: tMax, tempMaxTime: tMaxTime, tempMin: tMin, tempMinTime: tMinTime, uvMax: uvMax },
                tides: formattedTides
            };

            const response = new Response(JSON.stringify(responseData), {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=86400", // Cache en Edge por 24 horas
                    "X-Fetched-At": Date.now().toString()
                }
            });

            await cache.put(cacheKey, response.clone());
            return response;
        } catch (error) {
            console.error("fetchAndCache error:", error);
            throw error; // Re-throw to be handled by caller
        }
    };

    if (cachedResponse) {
        const fetchedAtStr = cachedResponse.headers.get("X-Fetched-At");
        const fetchedAt = fetchedAtStr ? parseInt(fetchedAtStr, 10) : 0;
        const ageMs = Date.now() - fetchedAt;
        
        // Si tiene más de 1 hora de antigüedad, actualizar en segundo plano (Stale-While-Revalidate)
        if (ageMs > 3600000) { // 1 hora
            context.waitUntil(fetchAndCache().catch(e => console.error("Background refresh failed", e)));
        }
        
        return cachedResponse;
    }

    // Si no hay caché (primera vez), esperar a que termine
    try {
        return await fetchAndCache();
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
