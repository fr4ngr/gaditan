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

    const cacheKey = `weather_v2_${locationInfo.id}`;

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
            let currentHumidity = "N/A";
            
            if (hDataArr && hDataArr[0]?.prediccion?.dia) {
                let count = 0;
                for (const d of hDataArr[0].prediccion.dia) {
                    const temps = getArr(d.temperatura);
                    const cielos = getArr(d.estadoCielo);
                    const probs = getArr(d.probPrecipitacion);
                    
                    const fecha = d.fecha ? d.fecha.substring(0, 10) : "";
                    for (let i = 0; i < temps.length; i++) {
                        if (count >= 24) break; // Solo queremos las proximas 24 horas
                        const t = temps[i];
                        // Buscar el cielo y prob correspondiente por periodo
                        const cielo = cielos.find(c => c.periodo === t.periodo) || cielos[i] || { value: "", descripcion: "" };
                        const prob = probs.find(p => p.periodo === t.periodo) || probs[i] || { value: 0 };
                        
                        hourlyForecast.push({
                            fecha: fecha,
                            periodo: t.periodo,
                            temp: t.value,
                            sky: cielo.value,
                            skyDesc: cielo.descripcion,
                            probPrecipitacion: prob.value
                        });
                        count++;
                    }
                }
            }
            
            if (hourlyData) {
                const temps = getArr(hourlyData.temperatura);
                if (temps.length > 0) {
                    currentTemp = temps[0].value;
                }
                const feelsLike = getArr(hourlyData.sensacionTermica);
                if (feelsLike.length > 0) {
                    currentFeelsLike = feelsLike[0].value;
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
                        // Extraer la racha máxima si existe
                        const gust = getArr(windObj.velocidad)[1]; // Aveces rachaMax viene después o en otra prop, revisemos
                        // Según AEMET: vientoAndRachaMax array, puede tener direccion y velocidad, pero rachaMax a veces viene separado en 'rachaMax' o en el mismo. 
                        // Realmente en horaria rachaMax suele ser un atributo separado `rachaMax` en dia, pero veamos si lo cogemos del objeto viento.
                    }
                }
                // Intento buscar rachaMax directa
                const rachas = getArr(hourlyData.rachaMax);
                if (rachas.length > 0 && rachas[0].value) {
                    currentWindGust = rachas[0].value;
                }
                
                const humedades = getArr(hourlyData.humedadRelativa);
                if (humedades.length > 0) {
                    currentHumidity = humedades[0].value;
                }
                const precipitacion = getArr(hourlyData.precipitacion);
                if (precipitacion.length > 0) {
                    currentPrecip = precipitacion[0].value;
                }
            }
            
            // Fallbacks if current data is missing but we have hourly forecast
            if (hourlyForecast.length > 0) {
                if (currentTemp === "N/A") currentTemp = hourlyForecast[0].temp;
                if (currentSky === "N/A") currentSky = hourlyForecast[0].sky;
                if (currentSkyDesc === "") currentSkyDesc = hourlyForecast[0].skyDesc;
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
                const currentFecha = spainTime.toISOString().substring(0, 10);
                const currentHourStr = spainTime.getHours().toString().padStart(2, '0');
                
                // Buscar la hora exacta o la primera disponible hacia el futuro
                let matchedHour = cachedData.hourly.find(h => h.fecha === currentFecha && h.periodo === currentHourStr);
                if (!matchedHour) {
                    matchedHour = cachedData.hourly.find(h => h.fecha > currentFecha || (h.fecha === currentFecha && h.periodo >= currentHourStr));
                }
                
                if (matchedHour) {
                    cachedData.current.temp = matchedHour.temp;
                    cachedData.current.sky = matchedHour.sky;
                    cachedData.current.skyDesc = matchedHour.skyDesc;
                }
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
