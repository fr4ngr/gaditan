/**
 * Motor de Ingesta Autónoma (Cerebro B)
 * Este endpoint está diseñado para ser llamado por un Cron Trigger (p.ej. cada hora).
 * Se encarga de descargar información pesada/lenta (clima de AEMET, agenda) y guardarla
 * en D1 de forma ultra rápida para que el Cerebro A (Chat) responda al instante.
 */
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    
    // 1. Verificación de Seguridad (CRON_SECRET)
    const secret = url.searchParams.get('secret');
    if (secret !== env.CRON_SECRET) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const results = {};

        // 2. Tarea 1: Ingesta del Clima de Playas (AEMET)
        try {
            const beaches = ['1101201', '1101203']; // La Caleta, La Victoria/Cortadura
            for (const beachId of beaches) {
                const playaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${beachId}/?api_key=${env.AEMET_API_KEY}`);
                if (!playaRes.ok) continue;
                
                const playaJson = await playaRes.json();
                if (playaJson.estado == 200 && playaJson.datos) {
                    const dataRes = await fetch(playaJson.datos);
                    const dataArr = await dataRes.json();
                    
                    if (dataArr && dataArr[0] && dataArr[0].prediccion && dataArr[0].prediccion.dia) {
                        const todayData = dataArr[0].prediccion.dia[0];
                        const beachData = {
                            nombre: dataArr[0].nombre,
                            estadoCielo: todayData.estadoCielo ? todayData.estadoCielo.descripcion1 : "N/A",
                            viento: todayData.viento ? todayData.viento.descripcion1 : "N/A",
                            oleaje: todayData.oleaje ? todayData.oleaje.descripcion1 : "N/A",
                            temperaturaAgua: todayData.tAgua ? `${todayData.tAgua.valor1}ºC` : "N/A",
                            sensacionTermica: todayData.sTermica ? todayData.sTermica.descripcion1 : "N/A",
                            uvMax: todayData.uvMax ? todayData.uvMax.valor1 : "N/A",
                            timestamp: new Date().toISOString()
                        };

                        const upsertQuery = `
                            INSERT INTO system_cache (key, value) 
                            VALUES (?, ?)
                            ON CONFLICT(key) DO UPDATE SET 
                                value = excluded.value, 
                                updated_at = CURRENT_TIMESTAMP;
                        `;
                        await env.DB.prepare(upsertQuery).bind(`beach_${beachId}`, JSON.stringify(beachData)).run();
                    }
                }
            }
            results.beaches = "updated";
        } catch (e) {
            console.error("Error fetching AEMET in cron:", e);
            results.beaches = "failed";
        }

        // 3. Tarea 2: Ingesta de Horarios de Transportes (CTAN)
        try {
            const stopsToSync = [
                { consorcioId: 2, stopId: 193 }, // Catamarán Puerto / Rota (Bahía)
                { consorcioId: 2, stopId: 300 }, // Bus San Fernando / Chiclana / Puerto Real (Bahía)
                { consorcioId: 2, stopId: 56 },  // Bus Cementerio Vuelta (Bahía)
                { consorcioId: 5, stopId: 1 },   // Bus Algeciras Estación San Bernardo (Gibraltar)
                { consorcioId: 5, stopId: 116 }, // Bus La Línea (Gibraltar)
                { consorcioId: 5, stopId: 143 }  // Bus Tarifa Apeadero (Gibraltar)
            ];

            for (const item of stopsToSync) {
                const res = await fetch(`http://api.ctan.es/v1/Consorcios/${item.consorcioId}/paradas/${item.stopId}/servicios`, { signal: AbortSignal.timeout(5000) });
                if (!res.ok) continue;
                
                const json = await res.json();
                if (json && json.servicios) {
                    const upsertQuery = `
                        INSERT INTO system_cache (key, value) 
                        VALUES (?, ?)
                        ON CONFLICT(key) DO UPDATE SET 
                            value = excluded.value, 
                            updated_at = CURRENT_TIMESTAMP;
                    `;
                    await env.DB.prepare(upsertQuery).bind(`transport_${item.consorcioId}_${item.stopId}`, JSON.stringify(json.servicios)).run();
                }
            }
            results.transport = "updated";
        } catch (e) {
            console.error("Error fetching CTAN in cron:", e);
            results.transport = "failed";
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Cerebro B ha sincronizado los datos correctamente.",
            results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
