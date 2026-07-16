import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { brains, systemPromptA, systemPromptB, abConfig } from './compiled-brains';
import { populateCache } from './cron';

function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userMessage = body.message;
        const sessionId = body.sessionId || 'anonymous';
        const userCity = body.city || null;
        const userProfile = body.userProfile || 'desconocido';
        
        // A/B Testing Assignment
        let activeVariant = 'A';
        let activeSystemPrompt = systemPromptA;
        if (abConfig && abConfig.active) {
            const hashVal = hashCode(sessionId) % 100;
            if (hashVal >= abConfig.trafficA) {
                activeVariant = 'B';
                activeSystemPrompt = systemPromptB || systemPromptA;
            }
        }
        
        if (!env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing key. Available env keys: " + Object.keys(env).join(", ") }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

        // ----------------------------------------------------
        // DYNAMIC REAL-TIME TRANSPORT RESOLVER & BEACH CACHE
        // ----------------------------------------------------
        const msgLower = (userMessage || '').toLowerCase();
        let isTransportQuery = false;
        let isBeachQuery = false;

        if (msgLower.includes('bus') || msgLower.includes('autobus') || msgLower.includes('catamaran') || msgLower.includes('barco') || msgLower.includes('horario')) {
            isTransportQuery = true;
        } else if (msgLower.includes('playa') || msgLower.includes('caleta') || msgLower.includes('victoria') || msgLower.includes('cortadura') || msgLower.includes('tiempo') || msgLower.includes('clima')) {
            isBeachQuery = true;
        }

        if (isTransportQuery) {
            try {
                let destination = null;
                let targetIdParadas = [300, 14]; // Plaza de España + Estación
                let isCatamaran = false;
                let icon = '🚌';

                if (msgLower.includes('catamaran') || msgLower.includes('barco')) {
                    isCatamaran = true;
                    targetIdParadas = [304]; // Puerto de Cádiz
                    icon = '⛴️';
                }

                // Detect destination town
                if (msgLower.includes('san fernando') || msgLower.includes('m-010') || msgLower.includes('m-011')) {
                    destination = 'San Fernando';
                } else if (msgLower.includes('chiclana') || msgLower.includes('m-020')) {
                    destination = 'Chiclana';
                } else if (msgLower.includes('puerto real') || msgLower.includes('m-030') || msgLower.includes('m-036')) {
                    destination = 'Puerto Real';
                } else if (msgLower.includes('el puerto') || msgLower.includes('santa maria') || msgLower.includes('puerto de santa maria')) {
                    destination = 'El Puerto';
                } else if (msgLower.includes('rota')) {
                    destination = 'Rota';
                } else if (msgLower.includes('jerez')) {
                    destination = 'Jerez';
                } else if (msgLower.includes('sanlucar') || msgLower.includes('sanlúcar')) {
                    destination = 'Sanlúcar';
                } else if (msgLower.includes('chipiona')) {
                    destination = 'Chipiona';
                } else if (msgLower.includes('medina')) {
                    destination = 'Medina';
                } else if (msgLower.includes('algeciras')) {
                    destination = 'Algeciras';
                } else if (msgLower.includes('conil')) {
                    destination = 'Conil';
                } else if (msgLower.includes('tarifa')) {
                    destination = 'Tarifa';
                } else if (msgLower.includes('barbate')) {
                    destination = 'Barbate';
                } else if (msgLower.includes('vejer')) {
                    destination = 'Vejer';
                }

                if (destination) {
                    // Check if it is outside the CTAN Bahía de Cádiz consortium (static fallback)
                    const staticRoutes: Record<string, any> = {
                        'Algeciras': {
                            title: 'Horarios Cádiz - Algeciras',
                            badge: '🚌 Horarios Generales',
                            content: 'Aquí tienes los horarios habituales de la línea Cádiz - Algeciras (operado por Transportes Comes):',
                            listItems: [
                                { title: '07:00, 09:00, 11:30', subtitle: 'Salidas de Mañana (Directo / Ruta)', icon: '🚌' },
                                { title: '14:00, 15:30, 17:30, 20:00', subtitle: 'Salidas de Tarde (Directo / Ruta)', icon: '🚌' },
                                { title: '1h 45m (Directo) / 2h 30m (Ruta)', subtitle: 'Duración estimada del viaje', icon: '⏱️' }
                            ]
                        },
                        'Conil': {
                            title: 'Horarios Cádiz - Conil',
                            badge: '🚌 Horarios Generales',
                            content: 'Aquí tienes los horarios habituales de la línea Cádiz - Conil de la Frontera (operado por Comes):',
                            listItems: [
                                { title: '08:00, 09:30, 11:00, 12:30', subtitle: 'Salidas de Mañana', icon: '🚌' },
                                { title: '14:00, 16:00, 18:30, 20:00, 21:30', subtitle: 'Salidas de Tarde/Noche', icon: '🚌' },
                                { title: '50 minutos', subtitle: 'Duración estimada del viaje', icon: '⏱️' }
                            ]
                        },
                        'Tarifa': {
                            title: 'Horarios Cádiz - Tarifa',
                            badge: '🚌 Horarios Generales',
                            content: 'Aquí tienes los horarios habituales de la línea Cádiz - Tarifa (operado por Comes):',
                            listItems: [
                                { title: '07:00, 09:00, 11:30', subtitle: 'Salidas de Mañana', icon: '🚌' },
                                { title: '14:00, 15:30, 17:30, 20:00', subtitle: 'Salidas de Tarde/Noche', icon: '🚌' },
                                { title: '1h 30m', subtitle: 'Duración estimada del viaje', icon: '⏱️' }
                            ]
                        }
                    };

                    if (staticRoutes[destination]) {
                        const card = {
                            cardType: 'ListCard',
                            ...staticRoutes[destination],
                            intentCategory: 'Transporte y movilidad',
                            suggestedBlocks: ['Ver paradas cercanas', '¿Cuánto cuesta el billete?']
                        };
                        return new Response(JSON.stringify(card), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }

                    // Otherwise, fetch live CTAN API
                    let allServices = [];
                    for (const stopId of targetIdParadas) {
                        try {
                            const res = await fetch(`http://api.ctan.es/v1/Consorcios/2/paradas/${stopId}/servicios`, { signal: AbortSignal.timeout(4000) });
                            const json = await res.json();
                            if (json && json.servicios) {
                                allServices = allServices.concat(json.servicios);
                            }
                        } catch (e) {
                            console.error(`Error querying CTAN stop ${stopId}:`, e);
                        }
                    }

                    // Filter matching destinations
                    let upcoming = allServices.filter((s: any) => 
                        s.destino && s.destino.toLowerCase().includes(destination.toLowerCase())
                    );

                    // Sort by departure time
                    upcoming.sort((a: any, b: any) => a.servicio.localeCompare(b.servicio));

                    // Map to card items
                    const listItems = upcoming.slice(0, 4).map((s: any) => ({
                        title: `${s.servicio} - Línea ${s.linea}`,
                        subtitle: s.nombre,
                        icon: icon
                    }));

                    if (listItems.length > 0) {
                        const card = {
                            cardType: 'ListCard',
                            content: `Aquí tienes las próximas salidas en tiempo real desde Cádiz hacia ${destination}:`,
                            title: `Próximas salidas a ${destination} (Tiempo Real)`,
                            badge: isCatamaran ? '⛴️ Catamarán en Vivo' : '🚌 Autobuses en Vivo',
                            listItems: listItems,
                            intentCategory: 'Transporte y movilidad',
                            suggestedBlocks: ['Ver paradas cercanas', '¿Y para volver?']
                        };

                        return new Response(JSON.stringify(card), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } else {
                        const card = {
                            cardType: 'ListCard',
                            content: `No hay salidas programadas en las próximas horas desde Cádiz hacia ${destination} en tiempo real.`,
                            title: `Salidas a ${destination}`,
                            badge: '🚌 Transporte',
                            listItems: [
                                { title: 'Sin servicios inminentes', subtitle: 'Prueba a consultar horarios generales en Comes.', icon: '⚠️' }
                            ],
                            intentCategory: 'Transporte y movilidad'
                        };
                        return new Response(JSON.stringify(card), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
            } catch (fpError) {
                console.error("Fast-Path Transport Error:", fpError);
            }
        }

        if (isBeachQuery && env.DB) {
            try {
                let fastPathKey = null;
                if (msgLower.includes('caleta')) {
                    fastPathKey = 'cron_beach_1101201';
                } else {
                    fastPathKey = 'cron_beach_1101203';
                }

                const cacheResult = await env.DB.prepare('SELECT value FROM system_cache WHERE key = ?').bind(fastPathKey).first();
                if (cacheResult && cacheResult.value) {
                    const parsedData = JSON.parse(cacheResult.value as string);
                    return new Response(JSON.stringify(parsedData), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    // Cache miss fallback
                    await populateCache(env);
                    const cacheResult2 = await env.DB.prepare('SELECT value FROM system_cache WHERE key = ?').bind(fastPathKey).first();
                    if (cacheResult2 && cacheResult2.value) {
                        const parsedData = JSON.parse(cacheResult2.value as string);
                        return new Response(JSON.stringify(parsedData), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
            } catch (beachError) {
                console.error("Fast-Path Beach Error:", beachError);
            }
        }

        // ----------------------------------------------------
        // RAG VECTOR SEARCH (Cloudflare Vectorize)
        // ----------------------------------------------------
        let cerebrosXml = "";
        let cerebrosFiltrados = [];
        try {
            const aiEmbedding = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: [userMessage] });
            const vector = aiEmbedding.data[0];

            const vecMatches = await env.VECTORIZE_INDEX.query(vector, { topK: 3 });
            
            if (vecMatches && vecMatches.matches && vecMatches.matches.length > 0) {
                const matchIds = vecMatches.matches.map(m => m.id);
                const placeholders = matchIds.map(() => '?').join(',');
                const query = `SELECT * FROM knowledge_base WHERE id IN (${placeholders})`;
                const dbResults = await env.DB.prepare(query).bind(...matchIds).all();
                
                if (dbResults && dbResults.results) {
                    cerebrosFiltrados = dbResults.results;
                    cerebrosXml = cerebrosFiltrados.map(b => `
<cerebro materia="${b.materia}" tipo="${b.tipo}" documento="${b.id}">
${b.content}
</cerebro>
`).join('');
                }
            }
        } catch (ragError) {
            console.error("Error en RAG Vectorize:", ragError);
        }

        const userCityContext = userCity ? `<contexto_usuario>\nEl usuario ha configurado explícitamente su ciudad actual como: ${userCity}. Prioriza y orienta tus recomendaciones a esta ciudad si es relevante.\n</contexto_usuario>\n` : "";
        const systemInstruction = (activeSystemPrompt || "Eres un asistente.").replace('{{CEREBROS_INJECTION_POINT}}', `<cerebros_activos>\n${cerebrosXml}\n</cerebros_activos>\n${userCityContext}`);

        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                cardType: {
                    type: SchemaType.STRING,
                    enum: ['TextCard', 'MapCard', 'NavigationCard', 'GalleryCard', 'HeroCard', 'ListCard', 'BusinessCard', 'ArticleCard', 'AlertCard', 'ProductCard', 'ProfileCard'],
                    description: "El tipo de tarjeta visual a mostrar."
                },
                content: {
                    type: SchemaType.STRING,
                    description: "Mensaje principal del asistente."
                },
                badge: { type: SchemaType.STRING, description: "Etiqueta superior (ej. '🏛️ Historia', '⚠️ Alerta')." },
                title: { type: SchemaType.STRING, description: "Título principal de la tarjeta." },
                subtitle: { type: SchemaType.STRING, description: "Subtítulo o texto secundario corto." },
                imageUrl: { type: SchemaType.STRING, description: "URL de una imagen principal (para HeroCard, ProductCard, ProfileCard)." },
                imageUrls: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Lista de URLs de imágenes (para GalleryCard)." },
                listItems: { 
                    type: SchemaType.ARRAY, 
                    items: { 
                        type: SchemaType.OBJECT, 
                        properties: { 
                            title: { type: SchemaType.STRING }, 
                            subtitle: { type: SchemaType.STRING },
                            icon: { type: SchemaType.STRING }
                        },
                        required: ["title"]
                    }, 
                    description: "Elementos de una lista (para ListCard)." 
                },
                lat: { type: SchemaType.STRING, description: "Latitud exacta (MapCard, NavigationCard)." },
                lon: { type: SchemaType.STRING, description: "Longitud exacta (MapCard, NavigationCard)." },
                locationTitle: { type: SchemaType.STRING, description: "Nombre del lugar (MapCard, NavigationCard)." },
                price: { type: SchemaType.STRING, description: "Precio actual (ProductCard, BusinessCard)." },
                oldPrice: { type: SchemaType.STRING, description: "Precio anterior tachado (ProductCard)." },
                contactName: { type: SchemaType.STRING, description: "Nombre del contacto (BusinessCard, ProfileCard)." },
                phoneNumber: { type: SchemaType.STRING, description: "Teléfono (BusinessCard, ProfileCard)." },
                whatsappNumber: { type: SchemaType.STRING, description: "WhatsApp (BusinessCard, ProfileCard)." },
                email: { type: SchemaType.STRING, description: "Email (BusinessCard, ProfileCard)." },
                website: { type: SchemaType.STRING, description: "URL de la página web (BusinessCard)." },
                buttonText: { type: SchemaType.STRING, description: "Texto del botón principal." },
                buttonAction: { type: SchemaType.STRING, description: "Comando o prompt interno a enviar cuando se hace clic en el botón." },
                intentCategory: {
                    type: SchemaType.STRING,
                    description: "Categoría de la intención del usuario. OBLIGATORIO.",
                    enum: ["Gastronomia", "Transporte y movilidad", "Alojamiento", "Clima", "Playas", "Zonas verdes", "Bahía", "Deporte", "Belleza", "Eventos-Agenda", "Compras", "Kids", "Mascotas", "Caravana", "Inclusivo", "Love", "Social-Sostenible", "Iglesias", "Catedral", "La Caleta", "Historia", "Arte", "Crucerista", "Flamencos", "Ocio", "Otros"]
                },
                suggestedBlocks: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING
                    },
                    description: "1 a 3 bloques sugeridos para guiar al usuario hacia la conversión."
                }
            },
            required: ['cardType', 'content', 'suggestedBlocks', 'intentCategory']
        };

        // Injecting the Profile into the prompt
        let finalSystemPrompt = systemInstruction;
        if (userProfile && userProfile !== 'desconocido') {
            finalSystemPrompt += `\n\n<GADITAN_PROFILE>\nEl usuario actual se ha identificado como: **${userProfile.toUpperCase()}**.\nAdapta tus respuestas, recomendaciones y tono a este perfil. Por ejemplo, si es Turista recomiéndale básicos; si es Gaditano, cosas locales o avanzadas; si es Negocio, facilítale opciones profesionales.\n</GADITAN_PROFILE>`;
        }

        // Construir la estructura final que Gemini espera
        let apiHistory: any[] = [];
        if (finalSystemPrompt) {
            apiHistory.push({ role: 'user', parts: [{ text: finalSystemPrompt }] });
            apiHistory.push({ role: 'model', parts: [{ text: 'Entendido. Actuaré según las directrices y el esquema JSON establecido, considerando el perfil del usuario.' }] });
        }

        let historyContents = body.history && body.history.length > 0 ? body.history : [{ role: 'user', parts: [{ text: userMessage }] }];
        historyContents = [...apiHistory, ...historyContents];
        const inputType = body.inputType || 'typed';

        const beachTool = {
            functionDeclarations: [{
                name: "get_beach_conditions",
                description: "Llama a esta función EXCLUSIVAMENTE cuando el usuario te pregunte explícitamente por el clima, el tiempo o el estado de las PLAYAS (ej. 'cómo está la playa', 'hace día de playa en la caleta', 'estado de las olas'). Devuelve datos reales de AEMET (temperatura del agua, oleaje, viento, sensación térmica). NO la llames para saludos genéricos.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        beach_id: {
                            type: SchemaType.STRING,
                            description: "El ID de la playa a consultar. Usa '1101201' si preguntan por La Caleta. Usa '1101203' si preguntan por La Victoria, Cortadura, Santa Maria del Mar, o por las playas de Cádiz en general."
                        }
                    },
                    required: ["beach_id"]
                }
            }]
        };

        const transportTool = {
            functionDeclarations: [{
                name: "get_transport_schedule",
                description: "Llama a esta función EXCLUSIVAMENTE cuando el usuario pregunte por horarios, próximas salidas o tiempos de espera de transporte público metropolitano desde o hacia Cádiz (ej. 'cuándo sale el catamarán', 'autobús a San Fernando', 'bus a Chiclana', 'horario al cementerio mancomunado'). Devuelve las próximas salidas reales del Consorcio de Transportes.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        route: {
                            type: SchemaType.STRING,
                            description: "La ruta solicitada. Debe ser uno de los siguientes valores exactos: 'catamaran_puerto', 'catamaran_rota', 'bus_sanfernando', 'bus_chiclana', 'bus_puertoreal', 'bus_cementerio_ida', 'bus_cementerio_vuelta'."
                        }
                    },
                    required: ["route"]
                }
            }]
        };

        let responseText = '';
        let currentModel = env.GEMINI_MODEL || 'gemini-3.5-flash';
        let latencyMs = 0;
        let tokensUsed = 0;
        const startTime = Date.now();
        
        try {
            let model = genAI.getGenerativeModel({
                model: currentModel,
                generationConfig: {
                    temperature: 0.1
                },
                tools: [beachTool, transportTool, { googleSearch: {} }]
            });

            let response = await model.generateContent({
                contents: historyContents
            });

            // Handle Function Call
            if (response.response.functionCalls() && response.response.functionCalls().length > 0) {
                const call = response.response.functionCalls()[0];
                let toolResponseData = { error: "No se pudo obtener datos" };
                let toolCalled = true;

                if (call.name === 'get_beach_conditions') {
                    const beachId = call.args.beach_id || '1101203';
                    
                    try {
                        const cacheResult = await env.DB.prepare('SELECT value FROM system_cache WHERE key = ?').bind(`beach_${beachId}`).first();
                        if (cacheResult && cacheResult.value) {
                            toolResponseData = JSON.parse(cacheResult.value);
                            toolResponseData.fuente = "Caché Rápida (Cerebro B)";
                        } else {
                            const playaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${beachId}/?api_key=${env.AEMET_API_KEY}`);
                            const playaJson = await playaRes.json();
                            if (playaJson.estado == 200 && playaJson.datos) {
                                const dataRes = await fetch(playaJson.datos);
                                const dataArr = await dataRes.json();
                                if (dataArr && dataArr[0] && dataArr[0].prediccion && dataArr[0].prediccion.dia) {
                                    const todayData = dataArr[0].prediccion.dia[0];
                                    toolResponseData = {
                                        nombre: dataArr[0].nombre,
                                        estadoCielo: todayData.estadoCielo ? todayData.estadoCielo.descripcion1 : "N/A",
                                        viento: todayData.viento ? todayData.viento.descripcion1 : "N/A",
                                        oleaje: todayData.oleaje ? todayData.oleaje.descripcion1 : "N/A",
                                        temperaturaAgua: todayData.tAgua ? `${todayData.tAgua.valor1}ºC` : "N/A",
                                        sensacionTermica: todayData.sTermica ? todayData.sTermica.descripcion1 : "N/A",
                                        uvMax: todayData.uvMax ? todayData.uvMax.valor1 : "N/A",
                                        fuente: "AEMET en vivo"
                                    };
                                }
                            }
                        }
                    } catch (e) {
                        console.error("AEMET Cache/API error:", e);
                    }
                } else if (call.name === 'get_transport_schedule') {
                    const route = call.args.route;
                    let idParada = null;
                    let targetDestino = null;

                    if (route === 'catamaran_puerto') { idParada = 193; targetDestino = 'El Puerto'; }
                    else if (route === 'catamaran_rota') { idParada = 193; targetDestino = 'Rota'; }
                    else if (route === 'bus_sanfernando') { idParada = 300; targetDestino = 'San Fernando'; }
                    else if (route === 'bus_chiclana') { idParada = 300; targetDestino = 'Chiclana'; }
                    else if (route === 'bus_puertoreal') { idParada = 300; targetDestino = 'Puerto Real'; }
                    else if (route === 'bus_cementerio_ida') { idParada = 300; targetDestino = 'Cementerio'; }
                    else if (route === 'bus_cementerio_vuelta') { idParada = 56; targetDestino = 'Cádiz'; }
                    
                    if (idParada) {
                        try {
                            const res = await fetch(`http://api.ctan.es/v1/Consorcios/2/paradas/${idParada}/servicios`, { signal: AbortSignal.timeout(5000) });
                            const json = await res.json();
                            if (json && json.servicios) {
                                let upcoming = json.servicios;
                                if (targetDestino) {
                                    upcoming = upcoming.filter(s => s.destino && s.destino.toLowerCase().includes(targetDestino.toLowerCase()));
                                }
                                
                                toolResponseData = {
                                    ruta_solicitada: route,
                                    parada_origen: json.servicios[0] ? json.servicios[0].nombreParada || `Parada ${idParada}` : 'Desconocida',
                                    proximas_salidas: upcoming.slice(0, 3).map(s => ({
                                        hora: s.servicio,
                                        linea: s.linea,
                                        destino: s.destino,
                                        nombre_ruta: s.nombre
                                    })),
                                    fuente: "Consorcio de Transportes de Andalucía (CTAN en vivo)"
                                };
                            }
                        } catch(e) {
                            console.error("CTAN API error:", e);
                        }
                    }
                } else {
                    toolCalled = false;
                }

                if (toolCalled) {
                    historyContents.push({
                        role: 'model',
                        parts: response.response.candidates[0].content.parts
                    });

                    historyContents.push({
                        role: 'function',
                        parts: [{
                            functionResponse: {
                                name: call.name,
                                response: toolResponseData
                            }
                        }]
                    });

                    model = genAI.getGenerativeModel({
                        model: currentModel,
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: schema,
                            temperature: 0.1
                        },
                        tools: [beachTool, transportTool, { googleSearch: {} }]
                    });

                    response = await model.generateContent({
                        contents: historyContents
                    });
                }
            }
            
            responseText = response.response.text();
            latencyMs = Date.now() - startTime;
            if (response.response.usageMetadata) {
                tokensUsed = response.response.usageMetadata.totalTokenCount || 0;
            }
            
        } catch (error: any) {
            console.error("Error with model:", error);
            let fallbackMsg = "Ha ocurrido un error de conexión con mi cerebro. Por favor, inténtalo de nuevo en unos segundos.";
            if (error.message && error.message.includes('524')) {
                fallbackMsg = "¡Uf! La conexión ha tardado demasiado y se ha agotado el tiempo de espera. ¿Podrías repetírmelo?";
            } else if (error.message && error.message.includes('429')) {
                fallbackMsg = "Estoy hablando con demasiada gente a la vez y me he quedado sin aliento. ¡Dame 1 minuto!";
            } else if (error.message && error.message.includes('503')) {
                fallbackMsg = "Mis servidores están saturados temporalmente. Por favor, inténtalo de nuevo en unos segundos.";
            } else if (error.message) {
                fallbackMsg = `Error interno: ${error.message}`;
            }
            return new Response(JSON.stringify({ error: fallbackMsg }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let parsedData;
        try {
            let cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            let startIdx = cleanText.indexOf('{');
            let jsonExtracted = null;
            if (startIdx !== -1) {
                let braceCount = 0;
                let inString = false;
                let escapeNext = false;
                
                for (let i = startIdx; i < cleanText.length; i++) {
                    const char = cleanText[i];
                    if (!escapeNext && char === '"') {
                        inString = !inString;
                    }
                    if (char === '\\' && inString) {
                        escapeNext = true;
                    } else {
                        escapeNext = false;
                    }

                    if (!inString) {
                        if (char === '{') braceCount++;
                        else if (char === '}') braceCount--;
                    }
                    
                    if (braceCount === 0 && !inString) {
                        try {
                            jsonExtracted = JSON.parse(cleanText.substring(startIdx, i + 1));
                            break;
                        } catch(e) {
                            // Ignorar
                        }
                    }
                }
            }
            
            if (jsonExtracted) {
                parsedData = jsonExtracted;
            } else {
                parsedData = JSON.parse(cleanText);
            }
        } catch(e) {
            let fallbackText = responseText.replace(/\{"cardType.*?\}/gs, '').trim();
            if (!fallbackText) fallbackText = "Ha ocurrido un error entendiendo el formato de la respuesta.";
            parsedData = { cardType: 'TextCard', content: fallbackText, suggestedBlocks: ['¿Qué más puedo ver?'], intentCategory: 'Otros' };
        }

        if (env.DB) {
            context.waitUntil((async () => {
                try {
                    const intentCat = parsedData.intentCategory || 'Otros';
                    const botRespText = parsedData.content || 'Sin respuesta';
                    const brainsInjected = cerebrosFiltrados.length > 0 ? cerebrosFiltrados.map(b => b.materia || b.id).join(', ') : '';
                    
                    await env.DB.prepare(
                        "INSERT INTO chat_logs (user_message, bot_response, intent_category, latency_ms, tokens_used, brains_injected, input_type, ab_variant) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                    ).bind(userMessage, botRespText, intentCat, latencyMs, tokensUsed, brainsInjected, inputType, activeVariant).run();
                } catch (dbError) {
                    console.error("D1 Insert Error:", dbError);
                }
            })());
        }

        return new Response(JSON.stringify(parsedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        let errorMessage = "Ha ocurrido un error inesperado.";
        if (error.message && error.message.includes('429')) {
            errorMessage = "¡Uf! Estoy hablando con demasiada gente a la vez y me he quedado sin aliento (Límite de la capa gratuita). Espera 1 minuto e inténtalo de nuevo.";
        } else if (error.message && error.message.includes('524')) {
            errorMessage = "¡Uf! La conexión ha tardado demasiado y se ha agotado el tiempo de espera. ¿Podrías repetírmelo?";
        } else if (error.message && error.message.includes('503')) {
            errorMessage = "Mis servidores están saturados temporalmente. Por favor, inténtalo de nuevo en unos segundos.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

