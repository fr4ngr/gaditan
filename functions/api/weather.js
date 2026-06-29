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
        if (diariaJson.estado == 200 && diariaJson.datos) {
            const dataRes = await fetch(diariaJson.datos);
            const dataArr = await dataRes.json();
            dailyData = dataArr[0].prediccion.dia[0]; // Today
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

        // Process data
        // For Cloudflare workers, new Date() is UTC. We need Spain time (UTC+1 or +2)
        // Best approach is just to use string matching or parse dates correctly.
        // Let's format the date to Europe/Madrid timezone
        const madridDateStr = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Madrid',
            hour: '2-digit',
            hour12: false
        }).format(new Date());
        let currentHourStr = madridDateStr;
        if (currentHourStr === '24') currentHourStr = '00';

        // Extract current temp and sky
        let currentTemp = "N/A";
        let currentSky = "N/A";
        let currentSkyDesc = "";
        
        if (hourlyData && hourlyData.temperatura) {
            const tempObj = hourlyData.temperatura.find((t) => t.periodo === currentHourStr);
            if (tempObj) currentTemp = tempObj.value;
        }

        if (hourlyData && hourlyData.estadoCielo) {
            const skyObj = hourlyData.estadoCielo.find((s) => s.periodo === currentHourStr);
            if (skyObj) {
                currentSky = skyObj.value;
                currentSkyDesc = skyObj.descripcion;
            }
        }
        
        // Extract Max/Min Temp and UV
        let tMax = "N/A";
        let tMin = "N/A";
        let uvMax = "N/A";

        if (dailyData && dailyData.temperatura) {
            tMax = dailyData.temperatura.maxima;
            tMin = dailyData.temperatura.minima;
        }
        if (dailyData && dailyData.uvMax !== undefined) {
            uvMax = dailyData.uvMax;
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
                skyDesc: currentSkyDesc
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
                "Cache-Control": "max-age=1800" // Cache for 30 mins
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
