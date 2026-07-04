export async function onRequest(context) {
    const { env, request } = context;
    const aemetKey = env.AEMET_API_KEY;

    if (!aemetKey) {
        return new Response(JSON.stringify({ error: "Missing AEMET API KEY" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Identificar la ciudad del usuario usando Cloudflare IP Geolocation
    const cfCity = (request.cf && request.cf.city) ? request.cf.city : "Cádiz";
    
    // Mapear ciudad a ID de municipio de AEMET y Zona de Avisos
    const cityMap = {
        "Cádiz": { id: "11012", name: "Cádiz", zona: "Litoral Gaditano" },
        "Jerez de la Frontera": { id: "11020", name: "Jerez de la Frontera", zona: "Campiña Gaditana" },
        "Algeciras": { id: "11004", name: "Algeciras", zona: "Estrecho" },
        "San Fernando": { id: "11031", name: "San Fernando", zona: "Litoral Gaditano" },
        "El Puerto de Santa María": { id: "11027", name: "El Puerto de Santa María", zona: "Litoral Gaditano" },
        "Chiclana de la Frontera": { id: "11015", name: "Chiclana de la Frontera", zona: "Litoral Gaditano" },
        "Sanlúcar de Barrameda": { id: "11032", name: "Sanlúcar de Barrameda", zona: "Litoral Gaditano" },
        "La Línea de la Concepción": { id: "11022", name: "La Línea", zona: "Estrecho" },
        "Puerto Real": { id: "11028", name: "Puerto Real", zona: "Litoral Gaditano" }
    };
    
    let locationInfo = cityMap[cfCity];
    // Si la ciudad no está en el mapa, por defecto Cádiz
    if (!locationInfo) {
        locationInfo = cityMap["Cádiz"];
    }

    const cacheKey = `weather_${locationInfo.id}`;

    // Función para obtener y procesar datos de AEMET y guardarlos en D1
    const syncWeather = async () => {
        try {
            // Predicción diaria (Max/Min)
            const diariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${locationInfo.id}/?api_key=${aemetKey}`);
            const diariaJson = await diariaRes.json();
            let dailyData = null;
            let dDataArr = null;
            if (diariaJson.estado == 200 && diariaJson.datos) {
                const dataRes = await fetch(diariaJson.datos);
                dDataArr = await dataRes.json();
                dailyData = dDataArr[0]?.prediccion?.dia[0];
            }

            // Predicción horaria (Actual)
            const horariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/${locationInfo.id}/?api_key=${aemetKey}`);
            const horariaJson = await horariaRes.json();
            let hourlyData = null;
            if (horariaJson.estado == 200 && horariaJson.datos) {
                const hDataRes = await fetch(horariaJson.datos);
                const hDataArr = await hDataRes.json();
                hourlyData = hDataArr[0]?.prediccion?.dia[0];
            }

            // Mareas (IHM) - Opcional, solo funciona con Cádiz (ID 42) pero sirve para el Litoral
            let tidesData = [];
            if (locationInfo.zona === "Litoral Gaditano") {
                try {
                    const tidesRes = await fetch(`https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=42&format=json`);
                    if (tidesRes.ok) {
                        const tidesJson = await tidesRes.json();
                        if (tidesJson?.mareas?.datos?.marea) {
                            tidesData = tidesJson.mareas.datos.marea.map(t => ({
                                type: t.tipo.toLowerCase(), time: t.hora, height: t.altura
                            }));
                        }
                    }
                } catch(e) {}
            }

            // Extracción de datos procesados
            let currentTemp = "N/A", currentSky = "N/A", currentSkyDesc = "";
            let currentWindDir = "N/A", currentWindSpeed = "N/A";
            let tMax = "N/A", tMin = "N/A", uvMax = "N/A";
            
            let forecast = []; // Previsión próximos días

            if (dailyData?.temperatura) {
                tMax = dailyData.temperatura.maxima;
                tMin = dailyData.temperatura.minima;
                uvMax = dailyData.uvMax || "N/A";
            }
            
            // Si tenemos dDataArr, extraemos la previsión de los próximos días
            if (dDataArr && dDataArr[0]?.prediccion?.dia?.length > 1) {
                const dias = dDataArr[0].prediccion.dia;
                for (let i = 1; i < Math.min(dias.length, 4); i++) {
                    const d = dias[i];
                    if (d.temperatura) {
                        forecast.push({
                            date: d.fecha,
                            max: d.temperatura.maxima,
                            min: d.temperatura.minima,
                            uv: d.uvMax || "N/A",
                            probPrecipitacion: Array.isArray(d.probPrecipitacion) ? d.probPrecipitacion[0]?.value : (d.probPrecipitacion?.value || 0)
                        });
                    }
                }
            }
            
            const getArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
            
            if (hourlyData) {
                const temps = getArr(hourlyData.temperatura);
                if (temps.length > 0) {
                    currentTemp = temps[0].value;
                }
                const cielos = getArr(hourlyData.estadoCielo);
                if (cielos.length > 0) {
                    currentSky = cielos[0].value;
                    currentSkyDesc = cielos[0].descripcion;
                }
                const vientos = getArr(hourlyData.vientoAndRachaMax);
                if (vientos.length > 0) {
                    const windObj = vientos.find(v => v.direccion && v.velocidad);
                    if (windObj) {
                        currentWindDir = getArr(windObj.direccion)[0];
                        currentWindSpeed = getArr(windObj.velocidad)[0];
                    }
                }
            }

            const responseData = {
                location: locationInfo.name,
                zona: locationInfo.zona,
                current: { temp: currentTemp, sky: currentSky, skyDesc: currentSkyDesc, windDir: currentWindDir, windSpeed: currentWindSpeed },
                daily: { tempMax: tMax, tempMin: tMin, uvMax: uvMax },
                forecast: forecast,
                tides: tidesData,
                alerts: [] // Avisos (Simplificado temporalmente)
            };

            // Guardar en D1 system_cache
            await env.DB.prepare(`
                INSERT INTO system_cache (key, value, updated_at) 
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
            `).bind(cacheKey, JSON.stringify(responseData)).run();

            return responseData;
        } catch (error) {
            console.error("SyncWeather Error:", error);
            return null; // Fallo silencioso
        }
    };

    // 1. Intentar leer de D1 (Instantáneo)
    let cachedData = null;
    let isStale = true;
    
    try {
        const row = await env.DB.prepare(`SELECT value, updated_at FROM system_cache WHERE key = ?`).bind(cacheKey).first();
        if (row) {
            cachedData = JSON.parse(row.value);
            // Comprobar si tiene más de 30 minutos de antigüedad
            const updatedDate = new Date(row.updated_at + 'Z'); // UTC
            const ageMs = Date.now() - updatedDate.getTime();
            
            if (ageMs < 30 * 60 * 1000) {
                isStale = false; // Fresco (menos de 30 mins)
            } else if (ageMs > 2 * 60 * 60 * 1000) {
                // Si tiene más de 2 horas de antigüedad, está DEMASIADO rancio (ej: datos de ayer).
                // Lo anulamos para obligar a descargar el clima real antes de responder al usuario.
                cachedData = null; 
            }
        }
    } catch (e) {
        console.error("DB Read Error", e);
    }

    if (cachedData) {
        // Devolver datos instantáneos al usuario
        const response = new Response(JSON.stringify(cachedData), {
            headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Cache", "X-Is-Stale": isStale.toString() }
        });
        
        // Si está rancio (stale), el servidor se encarga en background de actualizar AEMET
        if (isStale) {
            context.waitUntil(syncWeather());
        }
        return response;
    }

    // 2. Si D1 estaba vacío (nunca se había pedido esta ciudad), hacer fetch síncrono.
    const freshData = await syncWeather();
    if (freshData) {
        return new Response(JSON.stringify(freshData), { headers: { "Content-Type": "application/json", "X-Weather-Source": "AEMET-Fresh" } });
    }

    // 3. Fallback en caso extremo
    return new Response(JSON.stringify({ error: "Datos meteorológicos no disponibles temporalmente" }), {
        status: 503, headers: { "Content-Type": "application/json" }
    });
}
