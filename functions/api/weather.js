export async function onRequest(context) {
    const { env, request } = context;
    const aemetKey = env.AEMET_API_KEY;

    if (!aemetKey) {
        return new Response(JSON.stringify({ error: "Missing AEMET API KEY" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Identificar la ciudad del usuario
    const url = new URL(request.url);
    const queryCity = url.searchParams.get('city');
    const cfCity = queryCity ? queryCity : ((request.cf && request.cf.city) ? request.cf.city : "Cádiz");
    
    // Mapear ciudad a ID de municipio de AEMET y Zona de Avisos
    const cityMap = {
        "Alcalá de los Gazules": { id: "11001", name: "Alcalá de los Gazules", zona: "Campiña Gaditana" },
        "Alcalá del Valle": { id: "11002", name: "Alcalá del Valle", zona: "Grazalema" },
        "Algar": { id: "11003", name: "Algar", zona: "Campiña Gaditana" },
        "Algeciras": { id: "11004", name: "Algeciras", zona: "Estrecho" },
        "Algodonales": { id: "11005", name: "Algodonales", zona: "Grazalema" },
        "Arcos de la Frontera": { id: "11006", name: "Arcos de la Frontera", zona: "Campiña Gaditana" },
        "Barbate": { id: "11007", name: "Barbate", zona: "Litoral Gaditano" },
        "Los Barrios": { id: "11008", name: "Los Barrios", zona: "Estrecho" },
        "Benaocaz": { id: "11009", name: "Benaocaz", zona: "Grazalema" },
        "Bornos": { id: "11010", name: "Bornos", zona: "Campiña Gaditana" },
        "El Bosque": { id: "11011", name: "El Bosque", zona: "Grazalema" },
        "Cádiz": { id: "11012", name: "Cádiz", zona: "Litoral Gaditano" },
        "Castellar de la Frontera": { id: "11013", name: "Castellar de la Frontera", zona: "Estrecho" },
        "Conil de la Frontera": { id: "11014", name: "Conil de la Frontera", zona: "Litoral Gaditano" },
        "Chiclana de la Frontera": { id: "11015", name: "Chiclana de la Frontera", zona: "Litoral Gaditano" },
        "Chipiona": { id: "11016", name: "Chipiona", zona: "Litoral Gaditano" },
        "Espera": { id: "11017", name: "Espera", zona: "Campiña Gaditana" },
        "El Gastor": { id: "11018", name: "El Gastor", zona: "Grazalema" },
        "Grazalema": { id: "11019", name: "Grazalema", zona: "Grazalema" },
        "Jerez de la Frontera": { id: "11020", name: "Jerez de la Frontera", zona: "Campiña Gaditana" },
        "Jimena de la Frontera": { id: "11021", name: "Jimena de la Frontera", zona: "Estrecho" },
        "La Línea de la Concepción": { id: "11022", name: "La Línea de la Concepción", zona: "Estrecho" },
        "Medina-Sidonia": { id: "11023", name: "Medina-Sidonia", zona: "Campiña Gaditana" },
        "Olvera": { id: "11024", name: "Olvera", zona: "Grazalema" },
        "Paterna de Rivera": { id: "11025", name: "Paterna de Rivera", zona: "Campiña Gaditana" },
        "Prado del Rey": { id: "11026", name: "Prado del Rey", zona: "Grazalema" },
        "El Puerto de Santa María": { id: "11027", name: "El Puerto de Santa María", zona: "Litoral Gaditano" },
        "Puerto Real": { id: "11028", name: "Puerto Real", zona: "Litoral Gaditano" },
        "Puerto Serrano": { id: "11029", name: "Puerto Serrano", zona: "Grazalema" },
        "Rota": { id: "11030", name: "Rota", zona: "Litoral Gaditano" },
        "San Fernando": { id: "11031", name: "San Fernando", zona: "Litoral Gaditano" },
        "Sanlúcar de Barrameda": { id: "11032", name: "Sanlúcar de Barrameda", zona: "Litoral Gaditano" },
        "San Roque": { id: "11033", name: "San Roque", zona: "Estrecho" },
        "Setenil de las Bodegas": { id: "11034", name: "Setenil de las Bodegas", zona: "Grazalema" },
        "Tarifa": { id: "11035", name: "Tarifa", zona: "Estrecho" },
        "Torre Alháquime": { id: "11036", name: "Torre Alháquime", zona: "Grazalema" },
        "Trebujena": { id: "11037", name: "Trebujena", zona: "Campiña Gaditana" },
        "Ubrique": { id: "11038", name: "Ubrique", zona: "Grazalema" },
        "Vejer de la Frontera": { id: "11039", name: "Vejer de la Frontera", zona: "Litoral Gaditano" },
        "Villaluenga del Rosario": { id: "11040", name: "Villaluenga del Rosario", zona: "Grazalema" },
        "Villamartín": { id: "11041", name: "Villamartín", zona: "Campiña Gaditana" },
        "Zahara": { id: "11042", name: "Zahara", zona: "Grazalema" },
        "Benalup-Casas Viejas": { id: "11901", name: "Benalup-Casas Viejas", zona: "Litoral Gaditano" },
        "San José del Valle": { id: "11902", name: "San José del Valle", zona: "Campiña Gaditana" }
    };
    
    let locationInfo = cityMap[cfCity];
    // Si la ciudad no está en el mapa, por defecto Cádiz
    if (!locationInfo) {
        locationInfo = cityMap["Cádiz"];
    }

    const cacheKey = `weather_v4_${locationInfo.id}`;

    // Función para obtener y procesar datos de AEMET y guardarlos en D1
    const syncWeather = async () => {
        try {
            // Predicción diaria (Max/Min)
            const diariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${locationInfo.id}/?api_key=${aemetKey}`);
            const dJson = await diariaRes.json();
            
            // Predicción horaria (Actual)
            const horariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/${locationInfo.id}/?api_key=${aemetKey}`);
            const hJson = await horariaRes.json();

            if (!dJson.datos) {
                throw new Error("AEMET API error: no daily data URL provided");
            }

            const dDataRes = await fetch(dJson.datos);
            const dDataArr = await dDataRes.json();
            
            let hDataArr = null;
            if (hJson.datos) {
                try {
                    const hDataRes = await fetch(hJson.datos);
                    hDataArr = await hDataRes.json();
                } catch(e) {
                    console.error("Error fetching hourly data URL:", e);
                }
            }

            let dailyData = dDataArr[0]?.prediccion?.dia[0];
            let hourlyData = hDataArr ? hDataArr[0]?.prediccion?.dia[0] : null;

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
            let currentWindDir = "N/A", currentWindSpeed = "N/A", currentWindGust = "N/A";
            let currentFeelsLike = "N/A", currentPrecip = "0";
            let tMax = "N/A", tMin = "N/A", uvMax = "N/A";
            
            let forecast = []; // Previsión próximos días

            if (dailyData?.temperatura) {
                tMax = dailyData.temperatura.maxima;
                tMin = dailyData.temperatura.minima;
                uvMax = dailyData.uvMax || "N/A";
            }
            
            // Extraemos TODA la previsión de los próximos días (hasta 7)
            if (dDataArr && dDataArr[0]?.prediccion?.dia?.length > 0) {
                const dias = dDataArr[0].prediccion.dia;
                // Devolvemos todos los días (normalmente 7)
                for (let i = 0; i < dias.length; i++) {
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
            
            let hourlyForecast = [];
            
            if (hDataArr) {
                hDataArr[0].prediccion.dia.forEach(d => {
                    const fecha = d.fecha; // Formato YYYY-MM-DD
                    const temps = getArr(d.temperatura);
                    const feels = getArr(d.sensacionTermica);
                    const cielos = getArr(d.estadoCielo);
                    const probs = getArr(d.probPrecipitacion);
                    const vientos = getArr(d.vientoAndRachaMax);
                    const rachas = getArr(d.rachaMax);
                    const humedades = getArr(d.humedadRelativa);
                    const lluvias = getArr(d.precipitacion);

                    // MATCH them up by 'periodo'
                    temps.forEach(t => {
                        const periodo = t.periodo;
                        const tempValue = t.value;
                        const feelObj = feels.find(f => f.periodo === periodo) || {};
                        const skyObj = cielos.find(c => c.periodo === periodo) || {};
                        const probObj = probs.find(p => p.periodo === periodo) || {};
                        const windObj = vientos.find(v => v.periodo === periodo) || {};
                        const rachaObj = rachas.find(r => r.periodo === periodo) || {};
                        const humObj = humedades.find(h => h.periodo === periodo) || {};
                        const lluviaObj = lluvias.find(l => l.periodo === periodo) || {};

                        hourlyForecast.push({
                            fecha: fecha,
                            periodo: periodo,
                            temp: tempValue,
                            feelsLike: feelObj.value || "N/A",
                            sky: skyObj.value || "N/A",
                            skyDesc: skyObj.descripcion || "",
                            probPrecipitacion: probObj.value || "0",
                            windDir: windObj.direccion ? getArr(windObj.direccion)[0] : "N/A",
                            windSpeed: windObj.velocidad ? getArr(windObj.velocidad)[0] : "N/A",
                            windGust: rachaObj.value || "N/A",
                            humidity: humObj.value || "N/A",
                            precip: lluviaObj.value || "0"
                        });
                    });
                });
            }
            
            // We now have a rich hourlyForecast array. 
            // We will find the EXACT current hour, or the next available hour to populate "current"
            
            if (hourlyForecast.length > 0) {
                const now = new Date();
                const currentHourStr = now.getHours().toString().padStart(2, '0');
                const currentFechaStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,'0') + "-" + String(now.getDate()).padStart(2,'0');
                
                let matchedHour = hourlyForecast.find(h => h.fecha === currentFechaStr && h.periodo === currentHourStr);
                if (!matchedHour) {
                    matchedHour = hourlyForecast.find(h => h.fecha > currentFechaStr || (h.fecha === currentFechaStr && h.periodo >= currentHourStr));
                }
                if (!matchedHour) {
                    matchedHour = hourlyForecast[0]; // Fallback to first available
                }
                
                if (matchedHour) {
                    currentTemp = matchedHour.temp;
                    currentFeelsLike = matchedHour.feelsLike;
                    currentSky = matchedHour.sky;
                    currentSkyDesc = matchedHour.skyDesc;
                    currentWindDir = matchedHour.windDir;
                    currentWindSpeed = matchedHour.windSpeed;
                    currentWindGust = matchedHour.windGust;
                    currentHumidity = matchedHour.humidity;
                    currentPrecip = matchedHour.precip;
                }
            }

            const responseData = {
                location: locationInfo.name,
                zona: locationInfo.zona,
                current: { 
                    temp: currentTemp, 
                    feelsLike: currentFeelsLike,
                    sky: currentSky, 
                    skyDesc: currentSkyDesc, 
                    windDir: currentWindDir, 
                    windSpeed: currentWindSpeed, 
                    windGust: currentWindGust,
                    humidity: currentHumidity,
                    precip: currentPrecip
                },
                daily: { tempMax: tMax, tempMin: tMin, uvMax: uvMax },
                forecast: forecast,
                hourly: hourlyForecast,
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
            }
            
            // Actualizar el estado 'current' dinámicamente según la hora actual de España
            if (cachedData.hourly && cachedData.hourly.length > 0) {
                const spainTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Madrid"}));
                const currentFechaStr = spainTime.toISOString().substring(0, 10);
                const currentHourStr = spainTime.getHours().toString().padStart(2, '0');
                
                // Buscar la hora exacta o la primera disponible hacia el futuro
                let matchedHour = cachedData.hourly.find(h => h.fecha === currentFechaStr && h.periodo === currentHourStr);
                if (!matchedHour) {
                    // fallback to next available hour
                    matchedHour = cachedData.hourly.find(h => h.fecha > currentFechaStr || (h.fecha === currentFechaStr && h.periodo >= currentHourStr));
                }
                
                if (matchedHour) {
                    cachedData.current.temp = matchedHour.temp;
                    cachedData.current.feelsLike = matchedHour.feelsLike;
                    cachedData.current.sky = matchedHour.sky;
                    cachedData.current.skyDesc = matchedHour.skyDesc;
                    cachedData.current.windDir = matchedHour.windDir;
                    cachedData.current.windSpeed = matchedHour.windSpeed;
                    cachedData.current.windGust = matchedHour.windGust;
                    cachedData.current.humidity = matchedHour.humidity;
                    cachedData.current.precip = matchedHour.precip;
                }
            }
        }
    } catch (e) {
        console.error("DB Read Error", e);
    }

    if (cachedData) {
        // Devolver datos instantáneos al usuario
        const response = new Response(JSON.stringify(cachedData), {
            headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Cache", "X-Is-Stale": isStale.toString(), "Access-Control-Allow-Origin": "*" }
        });
        
        // Si está rancio (stale), el servidor se encarga en background de actualizar AEMET
        if (isStale) {
            context.waitUntil(syncWeather().catch(e => console.error("Background sync failed", e)));
        }
        return response;
    }

    // 2. Si D1 estaba vacío (ej: versión nueva de caché), hacer fetch síncrono.
    try {
        const freshData = await syncWeather();
        if (freshData) {
            return new Response(JSON.stringify(freshData), { headers: { "Content-Type": "application/json", "X-Weather-Source": "AEMET-Fresh", "Access-Control-Allow-Origin": "*" } });
        }
    } catch (e) {
        // 3. Fallback a versiones antiguas si AEMET falla por 429
        try {
            const oldRowV3 = await env.DB.prepare(`SELECT value FROM system_cache WHERE key = ?`).bind(`weather_v3_${locationInfo.id}`).first();
            if (oldRowV3) return new Response(oldRowV3.value, { headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Fallback-v3", "Access-Control-Allow-Origin": "*" } });
            
            const oldRowV2 = await env.DB.prepare(`SELECT value FROM system_cache WHERE key = ?`).bind(`weather_v2_${locationInfo.id}`).first();
            if (oldRowV2) return new Response(oldRowV2.value, { headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Fallback-v2", "Access-Control-Allow-Origin": "*" } });
        } catch (fallbackErr) {
            console.error("Fallback Cache Read Error:", fallbackErr);
        }
        
        return new Response(JSON.stringify({ error: "Datos meteorológicos no disponibles temporalmente. Error: " + e.message }), {
            status: 503, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
}
