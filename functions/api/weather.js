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

    const cacheKey = `weather_v7_${locationInfo.id}`;

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

            // Mareas (Si es de costa)
            if (locationInfo.costa) {
                const tideUrl = `https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=${locationInfo.ihm_id}&format=json`;
                try {
                    const tRes = await fetch(tideUrl);
                    if (tRes.ok) {
                        const tData = await tRes.json();
                        if (tData && tData.mareas && tData.mareas.datos && tData.mareas.datos.marea) {
                            tides = tData.mareas.datos.marea.map(m => ({
                                type: m.tipo.toLowerCase(),
                                time: m.hora,
                                height: m.altura
                            }));
                        }
                    }
                } catch (e) {
                    console.error("Mareas fetch error", e);
                }
            }

            // --- PROCESAMIENTO ---
            if (dDataArr && dDataArr[0]?.prediccion?.dia) {
                const dias = dDataArr[0].prediccion.dia;
                if (dias.length > 0) {
                    tMax = dias[0].temperatura.maxima;
                    tMin = dias[0].temperatura.minima;
                    uvMax = dias[0].uvMax || "N/A";

                    const getDailyMax = (prop) => {
                        if (!prop) return "N/A";
                        const arr = Array.isArray(prop) ? prop : [prop];
                        const vals = arr.map(x => parseInt(x.value || x.velocidad)).filter(x => !isNaN(x));
                        return vals.length > 0 ? String(Math.max(...vals)) : "N/A";
                    };

                    for (let i = 0; i < Math.min(dias.length, 7); i++) {
                        const d = dias[i];
                        forecast.push({
                            date: d.fecha,
                            max: d.temperatura.maxima,
                            min: d.temperatura.minima,
                            uv: d.uvMax || "N/A",
                            probPrecipitacion: Array.isArray(d.probPrecipitacion) ? d.probPrecipitacion[0]?.value : (d.probPrecipitacion?.value || 0),
                            windMax: getDailyMax(d.viento),
                            gustMax: getDailyMax(d.rachaMax)
                        });
                    }
                }
            }

            const getArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
            let hourlyForecast = [];
            
            if (hDataArr && hDataArr[0]?.prediccion?.dia) {
                hDataArr[0].prediccion.dia.forEach(d => {
                    const fecha = d.fecha;
                    const temps = getArr(d.temperatura);
                    const feels = getArr(d.sensacionTermica);
                    const cielos = getArr(d.estadoCielo);
                    const probs = getArr(d.probPrecipitacion);
                    const vientos = getArr(d.vientoAndRachaMax);
                    const humedades = getArr(d.humedadRelativa);
                    const lluvias = getArr(d.precipitacion);

                    temps.forEach(t => {
                        const periodo = String(t.periodo);
                        const feelObj = feels.find(f => String(f.periodo) == periodo) || {};
                        const skyObj = cielos.find(c => String(c.periodo) == periodo) || {};
                        const probObj = probs.find(p => String(p.periodo) == periodo) || {};
                        const windObj = vientos.find(v => String(v.periodo) == periodo) || {};
                        const humObj = humedades.find(h => String(h.periodo) == periodo) || {};
                        const lluviaObj = lluvias.find(l => String(l.periodo) == periodo) || {};

                        let extractedGust = "N/A";
                        if (windObj.velocidad) {
                            const velArr = getArr(windObj.velocidad);
                            extractedGust = velArr.length > 1 ? velArr[1] : (windObj.racha || "N/A");
                        }

                        hourlyForecast.push({
                            fecha: fecha,
                            periodo: periodo,
                            temp: t.value,
                            feelsLike: feelObj.value || "N/A",
                            sky: skyObj.value || "N/A",
                            skyDesc: skyObj.descripcion || "",
                            probPrecipitacion: probObj.value || "0",
                            windDir: windObj.direccion ? getArr(windObj.direccion)[0] : "N/A",
                            windSpeed: windObj.velocidad ? getArr(windObj.velocidad)[0] : "N/A",
                            windGust: extractedGust,
                            humidity: humObj.value || "N/A",
                            precip: lluviaObj.value || "0"
                        });
                    });
                });
            }

            if (hourlyForecast.length > 0) {
                const now = new Date();
                const currentHourStr = now.getHours().toString().padStart(2, '0');
                const currentFechaStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,'0') + "-" + String(now.getDate()).padStart(2,'0');
                
                let matched = hourlyForecast.find(h => h.fecha === currentFechaStr && h.periodo === currentHourStr) || 
                            hourlyForecast.find(h => h.fecha > currentFechaStr || (h.fecha === currentFechaStr && h.periodo >= currentHourStr)) || 
                            hourlyForecast[0];
                
                currentTemp = matched.temp;
                currentFeelsLike = matched.feelsLike;
                currentSky = matched.sky;
                currentSkyDesc = matched.skyDesc;
                currentWindDir = matched.windDir;
                currentWindSpeed = matched.windSpeed;
                currentWindGust = matched.windGust;
                currentHumidity = matched.humidity;
                currentPrecip = matched.precip;
            }

            const responseData = {
                location: locationInfo.name,
                zona: locationInfo.zona,
                current: { temp: currentTemp, feelsLike: currentFeelsLike, sky: currentSky, skyDesc: currentSkyDesc, windDir: currentWindDir, windSpeed: currentWindSpeed, windGust: currentWindGust, humidity: currentHumidity, precip: currentPrecip },
                daily: { tempMax: tMax, tempMin: tMin, uvMax: uvMax },
                forecast: forecast,
                hourly: hourlyForecast,
                tides: tides
            };

            try {
                await env.DB.prepare(`
                INSERT INTO system_cache (key, value, updated_at) 
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
            `).bind(cacheKey, JSON.stringify(responseData)).run();
            } catch (e) {
                console.error("D1 Cache Save Error", e);
            }

            return responseData;
        } catch (error) {
            console.error("AEMET Sync Error:", error);
            throw error;
        }
    };

    let isStale = false;
    let cachedData = null;
    
    try {
        const row = await env.DB.prepare(`SELECT value, updated_at FROM system_cache WHERE key = ?`).bind(cacheKey).first();
        if (row) {
            cachedData = JSON.parse(row.value);
            const updatedDate = new Date(row.updated_at + 'Z');
            if ((Date.now() - updatedDate.getTime()) > 2 * 60 * 60 * 1000) {
                isStale = true;
            }
            
            if (cachedData.hourly && cachedData.hourly.length > 0) {
                const spainTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Madrid"}));
                const currentFechaStr = spainTime.toISOString().substring(0, 10);
                const currentHourStr = spainTime.getHours().toString().padStart(2, '0');
                
                let matched = cachedData.hourly.find(h => h.fecha === currentFechaStr && h.periodo === currentHourStr) || 
                            cachedData.hourly.find(h => h.fecha > currentFechaStr || (h.fecha === currentFechaStr && h.periodo >= currentHourStr));
                
                if (matched) {
                    cachedData.current = { 
                        temp: matched.temp, feelsLike: matched.feelsLike, sky: matched.sky, 
                        skyDesc: matched.skyDesc, windDir: matched.windDir, windSpeed: matched.windSpeed, 
                        windGust: matched.windGust, humidity: matched.humidity, precip: matched.precip 
                    };
                }
            }
        }
    } catch (e) {
        console.error("DB Read Error", e);
    }

    if (cachedData) {
        const response = new Response(JSON.stringify(cachedData), {
            headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Cache", "X-Is-Stale": isStale.toString(), "Access-Control-Allow-Origin": "*" }
        });
        if (isStale) context.waitUntil(syncWeather().catch(e => console.error("Background sync failed", e)));
        return response;
    }

    try {
        const freshData = await syncWeather();
        if (freshData) {
            return new Response(JSON.stringify(freshData), { headers: { "Content-Type": "application/json", "X-Weather-Source": "AEMET-Fresh", "Access-Control-Allow-Origin": "*" } });
        }
    } catch (e) {
        try {
            const oldRowV6 = await env.DB.prepare(`SELECT value FROM system_cache WHERE key = ?`).bind(`weather_v6_${locationInfo.id}`).first();
            if (oldRowV6) return new Response(oldRowV6.value, { headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Fallback-v6", "Access-Control-Allow-Origin": "*" } });
            
            const oldRowV5 = await env.DB.prepare(`SELECT value FROM system_cache WHERE key = ?`).bind(`weather_v5_${locationInfo.id}`).first();
            if (oldRowV5) return new Response(oldRowV5.value, { headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Fallback-v5", "Access-Control-Allow-Origin": "*" } });
            
            const oldRowV4 = await env.DB.prepare(`SELECT value FROM system_cache WHERE key = ?`).bind(`weather_v4_${locationInfo.id}`).first();
            if (oldRowV4) return new Response(oldRowV4.value, { headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Fallback-v4", "Access-Control-Allow-Origin": "*" } });
            
            const oldRowV3 = await env.DB.prepare(`SELECT value FROM system_cache WHERE key = ?`).bind(`weather_v3_${locationInfo.id}`).first();
            if (oldRowV3) return new Response(oldRowV3.value, { headers: { "Content-Type": "application/json", "X-Weather-Source": "D1-Fallback-v3", "Access-Control-Allow-Origin": "*" } });
        } catch (fallbackErr) {
            console.error("Fallback Cache Read Error:", fallbackErr);
        }
        
        return new Response(JSON.stringify({ error: "Datos meteorológicos no disponibles temporalmente. Error: " + e.message }), {
            status: 503, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
}
