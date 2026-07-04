export async function onRequest(context) {
    const { env, request } = context;
    const aemetKey = env.AEMET_API_KEY;

    if (!aemetKey) {
        return new Response(JSON.stringify({ error: "Missing AEMET API KEY" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    // 1. Configurar la caché
    const cacheUrl = new URL(request.url);
    cacheUrl.search = ""; // Ignorar parámetros de búsqueda como ?t=123 para el cache hit
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    // 2. Intentar devolver de la caché primero
    try {
        let cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }
    } catch (e) {
        console.error("Cache match error:", e);
    }

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
                "Cache-Control": "public, max-age=3600" // Cache during 1 hour
            }
        });

        // 3. Guardar en caché para los próximos usuarios (background)
        context.waitUntil(cache.put(cacheKey, response.clone()));

        return response;

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
