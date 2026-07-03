import { GoogleGenAI, Type } from '@google/genai';
import { brains, systemPromptA, systemPromptB, abConfig } from './compiled-brains';

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

        // Inicializar Gemini usando la clave secreta del entorno (Cloudflare)
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

        // ----------------------------------------------------
        // RAG VECTOR SEARCH (Cloudflare Vectorize)
        // ----------------------------------------------------
        let cerebrosXml = "";
        let cerebrosFiltrados = [];
        try {
            // 1. Convertir la pregunta del usuario en un vector (Embedding)
            const aiEmbedding = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: [userMessage] });
            const vector = aiEmbedding.data[0];

            // 2. Buscar en Vectorize los 3 textos más relevantes
            const vecMatches = await env.VECTORIZE_INDEX.query(vector, { topK: 3 });
            
            if (vecMatches && vecMatches.matches && vecMatches.matches.length > 0) {
                // 3. Extraer los IDs encontrados y buscar su contenido real en D1
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

        const systemInstruction = (activeSystemPrompt || "Eres un asistente.").replace('{{CEREBROS_INJECTION_POINT}}', `<cerebros_activos>\n${cerebrosXml}\n</cerebros_activos>`);

        const schema = {
            type: Type.OBJECT,
            properties: {
                cardType: {
                    type: Type.STRING,
                    enum: ['TextCard', 'MapCard', 'NavigationCard', 'GalleryCard', 'HeroCard', 'ListCard', 'BusinessCard', 'ArticleCard', 'AlertCard', 'ProductCard', 'ProfileCard'],
                    description: "El tipo de tarjeta visual a mostrar."
                },
                content: {
                    type: Type.STRING,
                    description: "Mensaje principal del asistente."
                },
                badge: { type: Type.STRING, description: "Etiqueta superior (ej. '🏛️ Historia', '⚠️ Alerta')." },
                title: { type: Type.STRING, description: "Título principal de la tarjeta." },
                subtitle: { type: Type.STRING, description: "Subtítulo o texto secundario corto." },
                imageUrl: { type: Type.STRING, description: "URL de una imagen principal (para HeroCard, ProductCard, ProfileCard)." },
                imageUrls: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de URLs de imágenes (para GalleryCard)." },
                listItems: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            title: { type: Type.STRING }, 
                            subtitle: { type: Type.STRING },
                            icon: { type: Type.STRING }
                        },
                        required: ["title"]
                    }, 
                    description: "Elementos de una lista (para ListCard)." 
                },
                lat: { type: Type.STRING, description: "Latitud exacta (MapCard, NavigationCard)." },
                lon: { type: Type.STRING, description: "Longitud exacta (MapCard, NavigationCard)." },
                locationTitle: { type: Type.STRING, description: "Nombre del lugar (MapCard, NavigationCard)." },
                price: { type: Type.STRING, description: "Precio actual (ProductCard, BusinessCard)." },
                oldPrice: { type: Type.STRING, description: "Precio anterior tachado (ProductCard)." },
                contactName: { type: Type.STRING, description: "Nombre del contacto (BusinessCard, ProfileCard)." },
                phoneNumber: { type: Type.STRING, description: "Teléfono (BusinessCard, ProfileCard)." },
                whatsappNumber: { type: Type.STRING, description: "WhatsApp (BusinessCard, ProfileCard)." },
                email: { type: Type.STRING, description: "Email (BusinessCard, ProfileCard)." },
                website: { type: Type.STRING, description: "URL de la página web (BusinessCard)." },
                buttonText: { type: Type.STRING, description: "Texto del botón principal." },
                buttonAction: { type: Type.STRING, description: "Comando o prompt interno a enviar cuando se hace clic en el botón." },
                intentCategory: {
                    type: Type.STRING,
                    description: "Categoría de la intención del usuario. OBLIGATORIO.",
                    enum: ["Gastronomia", "Transporte y movilidad", "Alojamiento", "Clima", "Playas", "Zonas verdes", "Bahía", "Deporte", "Belleza", "Eventos-Agenda", "Compras", "Kids", "Mascotas", "Caravana", "Inclusivo", "Love", "Social-Sostenible", "Iglesias", "Catedral", "La Caleta", "Historia", "Arte", "Crucerista", "Flamencos", "Ocio", "Otros"]
                },
                suggestedBlocks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: "1 a 3 bloques sugeridos para guiar al usuario hacia la conversión."
                }
            },
            required: ['cardType', 'content', 'suggestedBlocks', 'intentCategory']
        };

        const historyContents = body.history && body.history.length > 0 ? body.history : [{ role: 'user', parts: [{ text: userMessage }] }];
        const inputType = body.inputType || 'typed';

        const beachTool = {
            functionDeclarations: [{
                name: "get_beach_conditions",
                description: "Llama a esta función EXCLUSIVAMENTE cuando el usuario te pregunte explícitamente por el clima, el tiempo o el estado de las PLAYAS (ej. 'cómo está la playa', 'hace día de playa en la caleta', 'estado de las olas'). Devuelve datos reales de AEMET (temperatura del agua, oleaje, viento, sensación térmica). NO la llames para saludos genéricos.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        beach_id: {
                            type: Type.STRING,
                            description: "El ID de la playa a consultar. Usa '1101201' si preguntan por La Caleta. Usa '1101203' si preguntan por La Victoria, Cortadura, Santa Maria del Mar, o por las playas de Cádiz en general."
                        }
                    },
                    required: ["beach_id"]
                }
            }]
        };

        let responseText = '';
        let currentModel = 'gemini-2.5-flash';
        let latencyMs = 0;
        let tokensUsed = 0;
        const startTime = Date.now();
        
        try {
            // PRIMERA LLAMADA: Con tools, pero SIN responseMimeType ni schema (porque son incompatibles)
            let configObj = {
                systemInstruction: systemInstruction,
                temperature: 0.1,
                tools: [beachTool]
            };

            let response = await ai.models.generateContent({
                model: currentModel,
                contents: historyContents,
                config: configObj
            });

            // Handle Function Call for Beaches
            if (response.functionCalls && response.functionCalls.length > 0) {
                const call = response.functionCalls[0];
                if (call.name === 'get_beach_conditions') {
                    const beachId = call.args.beach_id || '1101203';
                    let beachData = { error: "No se pudo obtener datos" };
                    
                    try {
                        // 1. Try Cache First (Cerebro B)
                        const cacheResult = await env.DB.prepare('SELECT value FROM system_cache WHERE key = ?').bind(`beach_${beachId}`).first();
                        if (cacheResult && cacheResult.value) {
                            beachData = JSON.parse(cacheResult.value);
                            beachData.fuente = "Caché Rápida (Cerebro B)";
                        } else {
                            // 2. Fallback to API (Cerebro A)
                            const playaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${beachId}/?api_key=${env.AEMET_API_KEY}`);
                            const playaJson = await playaRes.json();
                            if (playaJson.estado == 200 && playaJson.datos) {
                                const dataRes = await fetch(playaJson.datos);
                                const dataArr = await dataRes.json();
                                if (dataArr && dataArr[0] && dataArr[0].prediccion && dataArr[0].prediccion.dia) {
                                    const todayData = dataArr[0].prediccion.dia[0];
                                    beachData = {
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

                    // Append model's function call to history
                    historyContents.push({
                        role: 'model',
                        parts: [{
                            functionCall: {
                                name: call.name,
                                args: call.args
                            }
                        }]
                    });

                    // Append function response back to history
                    historyContents.push({
                        role: 'user',
                        parts: [{
                            functionResponse: {
                                name: call.name,
                                response: beachData
                            }
                        }]
                    });

                    // SEGUNDA LLAMADA: Sin tools, pero CON responseMimeType y schema para forzar el JSON
                    let configObjFinal = {
                        systemInstruction: systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: 0.1
                    };

                    response = await ai.models.generateContent({
                        model: currentModel,
                        contents: historyContents,
                        config: configObjFinal
                    });
                }
            }
            
            responseText = response.text;
            latencyMs = Date.now() - startTime;
            if (response.usageMetadata) {
                tokensUsed = response.usageMetadata.totalTokenCount || 0;
            }
            
        } catch (error: any) {
            console.error("Error with model:", error);
            // Return the actual error to the client to debug why gemini-2.5-flash failed
            return new Response(JSON.stringify({ error: `gemini-2.5-flash error: ${error.message || JSON.stringify(error)}` }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let parsedData;
        try {
            let cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            // AUTO-HEALING: Extraer el primer bloque JSON válido (balanceo de llaves)
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
                            // Ignorar y seguir intentando si falla por alguna razón
                        }
                    }
                }
            }
            
            if (jsonExtracted) {
                parsedData = jsonExtracted;
            } else {
                parsedData = JSON.parse(cleanText); // Intentar parsear todo si no se encontró un bloque claro
            }
        } catch(e) {
            // Si todo falla, limpiar las partes que parezcan JSON para no mostrarlas en crudo
            let fallbackText = responseText.replace(/\{"cardType.*?\}/gs, '').trim();
            if (!fallbackText) fallbackText = "Ha ocurrido un error entendiendo el formato de la respuesta.";
            parsedData = { cardType: 'TextCard', content: fallbackText, suggestedBlocks: ['¿Qué más puedo ver?'], intentCategory: 'Otros' };
        }

        // ----------------------------------------------------
        // LOG CONVERSATION TO D1 DATABASE IN BACKGROUND
        // ----------------------------------------------------
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

    } catch (error) {
        let errorMessage = "Ha ocurrido un error inesperado.";
        if (error.message && error.message.includes('429')) {
            errorMessage = "¡Uf! Estoy hablando con demasiada gente a la vez y me he quedado sin aliento (Límite de la capa gratuita). Espera 1 minuto e inténtalo de nuevo.";
        } else {
            errorMessage = error.message;
        }

        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
