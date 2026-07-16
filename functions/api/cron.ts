export async function onRequestGet(context) {
    const { request, env } = context;

    // Proteger el cron endpoint con una clave sencilla
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET || 'gaditan-cron-123'}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const startTime = Date.now();
    const results = {
        transport: 0,
        beaches: 0,
        errors: []
    };

    const ctanRoutes = [
        { key: 'cron_transport_catamaran_puerto', idParada: 304, destino: 'El Puerto', title: 'Catamarán a El Puerto', icon: '⛴️' },
        { key: 'cron_transport_catamaran_rota', idParada: 304, destino: 'Rota', title: 'Catamarán a Rota', icon: '⛴️' },
        { key: 'cron_transport_bus_sanfernando', idParada: 300, destino: 'San Fernando', title: 'Autobús a San Fernando', icon: '🚌' },
        { key: 'cron_transport_bus_chiclana', idParada: 300, destino: 'Chiclana', title: 'Autobús a Chiclana', icon: '🚌' },
        { key: 'cron_transport_bus_puertoreal', idParada: 300, destino: 'Puerto Real', title: 'Autobús a Puerto Real', icon: '🚌' },
        { key: 'cron_transport_bus_cementerio_ida', idParada: 300, destino: 'Cementerio', title: 'Autobús al Cementerio', icon: '🚌' }
    ];

    const aemetBeaches = [
        { key: 'cron_beach_1101201', id: '1101201', name: 'La Caleta' },
        { key: 'cron_beach_1101203', id: '1101203', name: 'La Victoria / Cortadura' }
    ];

    // 1. Process CTAN Routes
    for (const route of ctanRoutes) {
        try {
            const res = await fetch(`http://api.ctan.es/v1/Consorcios/2/paradas/${route.idParada}/servicios`, { signal: AbortSignal.timeout(5000) });
            const json = await res.json();
            
            if (json && json.servicios) {
                let upcoming = json.servicios.filter(s => s.destino && s.destino.toLowerCase().includes(route.destino.toLowerCase()));
                
                const listItems = upcoming.slice(0, 4).map(s => ({
                    title: `${s.servicio} - Línea ${s.linea}`,
                    subtitle: s.nombre,
                    icon: route.icon
                }));

                if (listItems.length > 0) {
                    const card = {
                        cardType: 'ListCard',
                        content: `Aquí tienes las próximas salidas desde Cádiz hacia ${route.destino}:`,
                        title: `Próximas salidas a ${route.destino}`,
                        badge: '🚍 Horarios en Vivo',
                        listItems: listItems,
                        intentCategory: 'Transporte y movilidad',
                        suggestedBlocks: ['Ver paradas cercanas', '¿Y para volver?']
                    };

                    await env.DB.prepare('INSERT INTO system_cache (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(route.key, JSON.stringify(card)).run();
                    results.transport++;
                }
            }
        } catch (e) {
            results.errors.push(`CTAN ${route.key}: ${e.message}`);
        }
    }

    // 2. Process AEMET Beaches
    if (env.AEMET_API_KEY) {
        for (const beach of aemetBeaches) {
            try {
                const playaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${beach.id}/?api_key=${env.AEMET_API_KEY}`, { signal: AbortSignal.timeout(5000) });
                const playaJson = await playaRes.json();
                
                if (playaJson.estado == 200 && playaJson.datos) {
                    const dataRes = await fetch(playaJson.datos);
                    const dataArr = await dataRes.json();
                    
                    if (dataArr && dataArr[0] && dataArr[0].prediccion && dataArr[0].prediccion.dia) {
                        const todayData = dataArr[0].prediccion.dia[0];
                        
                        const listItems = [
                            { title: todayData.estadoCielo ? todayData.estadoCielo.descripcion1 : "Desconocido", subtitle: "Estado del cielo", icon: "⛅" },
                            { title: todayData.viento ? todayData.viento.descripcion1 : "N/A", subtitle: "Viento", icon: "💨" },
                            { title: todayData.oleaje ? todayData.oleaje.descripcion1 : "N/A", subtitle: "Oleaje", icon: "🌊" },
                            { title: todayData.temperaturaAgua ? `${todayData.temperaturaAgua.valor1}°C` : "N/A", subtitle: "Temp. Agua", icon: "🌡️" },
                            { title: todayData.sensacionTermica ? `${todayData.sensacionTermica.valor1}°C` : "N/A", subtitle: "Sensación Térmica", icon: "🥶" }
                        ];

                        const card = {
                            cardType: 'ListCard',
                            content: `Aquí tienes la previsión actual de la playa ${beach.name}:`,
                            title: `Estado de la playa: ${beach.name}`,
                            badge: '🏖️ AEMET en Vivo',
                            listItems: listItems,
                            intentCategory: 'Playas',
                            suggestedBlocks: ['Chiringuitos cercanos', '¿Y en La Caleta?']
                        };

                        await env.DB.prepare('INSERT INTO system_cache (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(beach.key, JSON.stringify(card)).run();
                        results.beaches++;
                    }
                }
            } catch (e) {
                results.errors.push(`AEMET ${beach.key}: ${e.message}`);
            }
        }
    }

    return new Response(JSON.stringify({ 
        success: true, 
        message: 'Cache pre-warmed successfully',
        timeMs: Date.now() - startTime,
        results
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
