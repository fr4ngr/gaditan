export async function onRequest(context) {
    const { env } = context;
    const aemetKey = env.AEMET_API_KEY;

    if (!aemetKey) {
        return new Response(JSON.stringify({ error: "Missing AEMET API KEY" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // 1. Fetch AEMET Diaria (Max/Min temps, UV)
        const diariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/11012/?api_key=${aemetKey}`);
        const diariaJson = await diariaRes.json();
        
        let dailyData = null;
        let dDataArr = null;
        if (diariaJson.estado == 200 && diariaJson.datos) {
            const dataRes = await fetch(diariaJson.datos);
            dDataArr = await dataRes.json();
            dailyData = dDataArr[0].prediccion.dia[0]; // Today
        }

        // 2. Fetch AEMET Horaria (Current temp, sky)
        const horariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/11012/?api_key=${aemetKey}`);
        const horariaJson = await horariaRes.json();
        
        let hourlyData = null;
        if (horariaJson.estado == 200 && horariaJson.datos) {
            const hDataRes = await fetch(horariaJson.datos);
            const hDataArr = await hDataRes.json();
            hourlyData = hDataArr[0].prediccion.dia[0]; // Today
        }

        // 3. Fetch Tides from IHM (ID 42 = Cadiz)
        let tidesData = null;
        try {
            const tidesRes = await fetch(`https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=42&format=json`);
            if (tidesRes.ok) {
                const tidesJson = await tidesRes.json();
                if (tidesJson && tidesJson.mareas && tidesJson.mareas.datos) {
                    tidesData = tidesJson.mareas.datos.marea; // Array of tides (bajamar/pleamar)
                }
            }
        } catch (e) {
            console.error("Error fetching tides:", e);
        }

        // Extraer datos útiles
        let currentTemp = "N/A";
        let currentSky = "N/A";
        let currentSkyDesc = "";
        let currentWindDir = "N/A";
        let currentWindSpeed = "N/A";
        let tMax = "N/A";
        let tMin = "N/A";
        let uvMax = "N/A";

        if (dailyData) {
            if (dailyData.temperatura) {
                tMax = dailyData.temperatura.maxima;
                tMin = dailyData.temperatura.minima;
            }
            if (dailyData.uvMax !== undefined) {
                uvMax = dailyData.uvMax;
            } else if (diariaJson && diariaJson.datos && dDataArr) {
                // If today has no UV, try tomorrow
                const tomorrow = dDataArr[0].prediccion?.dia[1];
                if (tomorrow && tomorrow.uvMax !== undefined) {
                    uvMax = tomorrow.uvMax;
                }
            }
        }

        if (hourlyData) {
            if (hourlyData.temperatura && hourlyData.temperatura.length > 0) {
                currentTemp = hourlyData.temperatura[0].value;
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

        // Tides formatting
        const formattedTides = [];
        if (tidesData && Array.isArray(tidesData)) {
            tidesData.forEach(t => {
                formattedTides.push({
                    type: t.tipo.toLowerCase(), // 'pleamar' or 'bajamar'
                    time: t.hora,
                    height: t.altura
                });
            });
        }

        return new Response(JSON.stringify({
            location: "Cádiz",
            current: {
                temp: currentTemp,
                sky: currentSky,
                skyDesc: currentSkyDesc,
                windDir: currentWindDir,
                windSpeed: currentWindSpeed
            },
            daily: {
                tempMax: tMax,
                tempMin: tMin,
                uvMax: uvMax
            },
            tides: formattedTides
        }), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate" // Prevent caching issues during test
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
