import { GoogleGenAI, Type } from '@google/genai';
import { brains, systemPrompt } from './compiled-brains';

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userMessage = body.message;
        
        if (!env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing key. Available env keys: " + Object.keys(env).join(", ") }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Inicializar Gemini usando la clave secreta del entorno (Cloudflare)
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

        // ENRUTADOR DUAL-BRAIN
        const routerInstruction = `Eres un enrutador inteligente para Cádiz. Analiza la conversación y decide qué tipo de conocimiento necesita para responder al usuario:
- "A_oficial": Si pregunta sobre transporte público, autobuses, normativas, leyes, tarifas, ordenanzas, precios de taxi, reglas municipales o cosas oficiales.
- "B_ventas": Si pregunta por turismo, hoteles, restaurantes, ocio, qué ver, playas, compras, eventos o necesita recomendaciones comerciales.
- "AMBOS": Si la pregunta mezcla conceptos oficiales y turísticos.
Devuelve ÚNICAMENTE UNA de las 3 palabras: A_oficial, B_ventas, o AMBOS. Sin formato ni texto adicional.`;

        let ruta = "AMBOS";
        try {
            const routerResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: body.history && body.history.length > 0 ? body.history : [{ role: 'user', parts: [{ text: userMessage }] }],
                config: { systemInstruction: routerInstruction, temperature: 0.0, maxOutputTokens: 5 }
            });
            const rText = routerResponse.text.trim().toUpperCase();
            if (rText.includes("A_OFICIAL")) ruta = "A_oficial";
            else if (rText.includes("B_VENTAS")) ruta = "B_ventas";
        } catch(e) {
            console.error("Router error:", e);
        }

        let cerebrosFiltrados = brains;
        if (ruta === "A_oficial") {
             cerebrosFiltrados = brains.filter(b => b.tipo === "A_oficial");
        } else if (ruta === "B_ventas") {
             cerebrosFiltrados = brains.filter(b => b.tipo === "B_ventas");
        }

        const cerebrosXml = cerebrosFiltrados.map(b => `
<cerebro materia="${b.materia}" tipo="${b.tipo}" documento="${b.fileName}">
${b.content}
</cerebro>
`).join('');

        const systemInstruction = (systemPrompt || "Eres un asistente.").replace('{{CEREBROS_INJECTION_POINT}}', `<cerebros_activos ruta="${ruta}">\n${cerebrosXml}\n</cerebros_activos>`);

        const schema = {
            type: Type.OBJECT,
            properties: {
                cardType: {
                    type: Type.STRING,
                    enum: ['TextCard', 'TariffCard', 'PriceCard', 'RuleCard', 'ContactCard', 'MapCard', 'NavigationCard', 'ReservationCard', 'AffiliateCard', 'GalleryCard'],
                    description: "El tipo de tarjeta visual a mostrar. Usa MapCard para mostrar cualquier ubicación en el mapa interactivo. Usa GalleryCard para mostrar fotos."
                },
                content: {
                    type: Type.STRING,
                    description: "Mensaje del asistente. OBLIGATORIO: Párrafos cortos (1-2 líneas), uso de HTML/Markdown con <b>negritas</b>. PROHIBIDO escribir muros de texto. PROHIBIDO pedir perdón por no mostrar mapas o fotos. ¡NUNCA incluyas el número literal si usas ContactCard!"
                },
                priceEstimate: { type: Type.STRING, description: "Precio estimado con símbolo €. Solo para PriceCard." },
                routeDetails: { type: Type.STRING, description: "Resumen de ruta/cálculo. Solo para PriceCard." },
                lawSource: { type: Type.STRING, description: "Normativa exacta. Solo para RuleCard." },
                contactName: { type: Type.STRING, description: "Nombre del negocio o entidad. Solo para ContactCard." },
                phoneNumber: { type: Type.STRING, description: "Número de teléfono oficial. Solo para ContactCard." },
                whatsappNumber: { type: Type.STRING, description: "Número de WhatsApp. Solo para ContactCard." },
                locationTitle: { type: Type.STRING, description: "Nombre del lugar (ej. 'Playa Victoria', 'Parada Hospital'). Solo para MapCard/NavigationCard." },
                lat: { type: Type.STRING, description: "Latitud exacta. Solo para MapCard/NavigationCard." },
                lon: { type: Type.STRING, description: "Longitud exacta. Solo para MapCard/NavigationCard." },
                imageUrls: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de URLs de imágenes. Solo para GalleryCard." },
                reservationEmail: { type: Type.STRING, description: "Email de destino para la reserva. Solo para ReservationCard." },
                reservationSubject: { type: Type.STRING, description: "Asunto del email. Solo para ReservationCard." },
                reservationTitle: { type: Type.STRING, description: "Título del servicio a reservar. Solo para ReservationCard." },
                affiliateTitle: { type: Type.STRING, description: "Título del producto/servicio. Solo para AffiliateCard." },
                affiliateUrl: { type: Type.STRING, description: "URL de reserva o compra. Solo para AffiliateCard." },
                affiliatePrice: { type: Type.STRING, description: "Precio o descuento sugerido. Solo para AffiliateCard." },
                affiliateImage: { type: Type.STRING, description: "URL de la imagen del producto. Solo para AffiliateCard." },
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

        const beachTool = {
            functionDeclarations: [{
                name: "get_beach_conditions",
                description: "Llama a esta función EXCLUSIVAMENTE cuando el usuario te pregunte explícitamente por el clima, el tiempo o el estado de las PLAYAS (ej. 'cómo está la playa', 'hace día de playa en la caleta', 'estado de las olas'). Devuelve datos reales de AEMET (temperatura del agua, oleaje, viento, sensación térmica). NO la llames para saludos genéricos ni para preguntas de taxis.",
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
                                    uvMax: todayData.uvMax ? todayData.uvMax.valor1 : "N/A"
                                };
                            }
                        }
                    } catch (e) {
                        console.error("AEMET API error:", e);
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
            // Limpiar posibles bloques markdown de código si la primera llamada (sin schema) devolvió texto
            let cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanText);
        } catch(e) {
            // Si el modelo alucinó texto plano
            parsedData = { cardType: 'TextCard', content: responseText, suggestedBlocks: ['🚕 Ver tarifas'], intentCategory: 'Otros' };
        }

        // ----------------------------------------------------
        // LOG CONVERSATION TO D1 DATABASE IN BACKGROUND
        // ----------------------------------------------------
        if (env.DB) {
            context.waitUntil((async () => {
                try {
                    const intentCat = parsedData.intentCategory || 'Otros';
                    const botRespText = parsedData.content || 'Sin respuesta';
                    await env.DB.prepare(
                        "INSERT INTO chat_logs (user_message, bot_response, intent_category) VALUES (?, ?, ?)"
                    ).bind(userMessage, botRespText, intentCat).run();
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
