import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
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
        let finalSystemPrompt = activeSystemPrompt;
        if (userProfile && userProfile !== 'desconocido') {
            finalSystemPrompt += `\n\n<GADITAN_PROFILE>\nEl usuario actual se ha identificado como: **${userProfile.toUpperCase()}**.\nAdapta tus respuestas, recomendaciones y tono a este perfil. Por ejemplo, si es Turista recomiéndale básicos; si es Gaditano, cosas locales o avanzadas; si es Negocio, facilítale opciones profesionales.\n</GADITAN_PROFILE>`;
        }

        // Construir la estructura final que Gemini espera
        let apiHistory = [];
        if (finalSystemPrompt) {
            apiHistory.push({ role: 'user', parts: [{ text: finalSystemPrompt }] });
            apiHistory.push({ role: 'model', parts: [{ text: 'Entendido. Actuaré según las directrices y el esquema JSON establecido, considerando el perfil del usuario.' }] });
        }

        const historyContents = body.history && body.history.length > 0 ? body.history : [{ role: 'user', parts: [{ text: userMessage }] }];
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

        let responseText = '';
        let currentModel = 'gemini-1.5-flash';
        let latencyMs = 0;
        let tokensUsed = 0;
        const startTime = Date.now();
        
        try {
            let model = genAI.getGenerativeModel({
                model: currentModel,
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.1
                },
                tools: [beachTool]
            });

            let response = await model.generateContent({
                contents: historyContents
            });

            // Handle Function Call for Beaches
            if (response.response.functionCalls() && response.response.functionCalls().length > 0) {
                const call = response.response.functionCalls()[0];
                if (call.name === 'get_beach_conditions') {
                    const beachId = call.args.beach_id || '1101203';
                    let beachData = { error: "No se pudo obtener datos" };
                    
                    try {
                        const cacheResult = await env.DB.prepare('SELECT value FROM system_cache WHERE key = ?').bind(`beach_${beachId}`).first();
                        if (cacheResult && cacheResult.value) {
                            beachData = JSON.parse(cacheResult.value);
                            beachData.fuente = "Caché Rápida (Cerebro B)";
                        } else {
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

                    historyContents.push({
                        role: 'model',
                        parts: [{
                            functionCall: {
                                name: call.name,
                                args: call.args
                            }
                        }]
                    });

                    historyContents.push({
                        role: 'function',
                        parts: [{
                            functionResponse: {
                                name: call.name,
                                response: beachData
                            }
                        }]
                    });

                    model = genAI.getGenerativeModel({
                        model: currentModel,
                        systemInstruction: systemInstruction,
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: schema,
                            temperature: 0.1
                        }
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
            return new Response(JSON.stringify({ error: `gemini-1.5-flash error: ${error.message || JSON.stringify(error)}` }), {
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

