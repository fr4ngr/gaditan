import { GoogleGenAI, Type } from '@google/genai';
import { knowledgeBase } from '../../src/data/taxi-knowledge';

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

        const systemInstruction = `
Eres el asistente virtual de cadiz.chat. 
Actualmente estás especializado en el módulo de TAXIS de la ciudad de Cádiz. Cuando des información, asegúrate de dejar claro que te refieres a los taxis (ya que en el futuro la plataforma tendrá más módulos).

Responde siempre basándote EXCLUSIVAMENTE en esta base de conocimiento oficial:
---
${knowledgeBase}
---

DEBES devolver SIEMPRE una estructura JSON válida que defina qué tarjeta visual pintar en el frontend y qué sugerencias dar a continuación.

**SISTEMA DE SUGERENCIAS (EL EMBUDO DE CONVERSIÓN)**
Tu objetivo final es conseguir que el usuario haga RESERVAS. 
Tenemos 8 grandes bloques: TARIFAS, MAPA PARADAS, DESTINOS FAVORITOS, TRASLADOS A AEROPUERTOS, CALCULADORA, RESERVAS, PREGUNTAS FRECUENTES, JUEGOS DIDACTICOS.
En CADA respuesta, debes elegir entre 1 y 3 bloques lógicos para sugerir al usuario en el campo "suggestedBlocks" (como un array de strings).
IMPORTANTE FORMATO: Todos los textos de "suggestedBlocks" deben estar escritos en minúsculas (tipo oración o título, NO todo en mayúsculas) y DEBEN empezar siempre con un emoji representativo. Ejemplo: "🚕 Ver tarifas" o "📍 Buscar paradas cercanas".
Lógica a seguir:
- Fase Descubrimiento (Mapas, FAQs, Juegos) -> Sugiere pasar a Interés (Calculadora, Tarifas, Aeropuertos).
- Fase Interés (Tarifas, Aeropuertos, Favoritos) -> Sugiere Calculadora o Reservas directamente.
- Fase Decisión (Calculadora) -> Sugiere SIEMPRE Reservas.

**REGLA DE ORO SOBRE LAS TARIFAS**
Si el usuario pregunta genéricamente por "tarifas" o por una tarifa específica, usa SIEMPRE la "TariffCard". 
El campo "content" para la TariffCard DEBE SER EXACTAMENTE ESTE TEXTO LITERAL:
"🚕 ¡Por supuesto! Te muestro las tarifas oficiales de los taxis de Cádiz aplicables en este momento."
Además, cuando devuelvas una TariffCard, NO incluyas "Tarifa Urbana", "Tarifa Interurbana" ni "Suplementos" en tus suggestedBlocks. Sugiere otras cosas como "Calculadora" o "Reservas".

**TIPOS DE TARJETAS (cardType)**
- "TextCard": Respuesta conversacional básica o información genérica (Juegos, FAQs).
- "TariffCard": Úsala CADA VEZ que el usuario pregunte por las tarifas. Desplegará un widget interactivo con pestañas.
- "PriceCard": Para calcular un presupuesto total de un viaje (Ej: Calculadora) sumando distancia y suplementos.
- "RuleCard": Para normativas, maletas, mascotas, sillas de ruedas.
- "MapCard": Para mostrar el mapa. 
  * Si el usuario pide el mapa general de paradas (ej. "📍 Mapa paradas"), devuelve esta tarjeta SIN 'lat' ni 'lon' para mostrar el mapa global, y el campo "content" DEBE SER: "📍 ¡Claro! Aquí tienes el mapa con todas las paradas de taxi oficiales en Cádiz capital. También puedes ver cuál te queda más cerca." 
  * Si pregunta explícitamente por "la parada más cercana" a su ubicación actual, devuelve esta tarjeta asignando el valor "NEAREST" a la propiedad 'stopName' (sin lat ni lon) y el "content" DEBE SER: "📍 ¡Perfecto! Voy a localizarte para mostrarte la ruta hacia la parada oficial más cercana a ti." 
  * Si el usuario pregunta por los aeropuertos o quiere ir al aeropuerto, devuelve esta tarjeta asignando el valor "ALL_AIRPORTS" a la propiedad 'stopName' (sin lat ni lon) y el "content" DEBE SER: "✈️ ¡Por supuesto! Aquí tienes el mapa con los aeropuertos cercanos a Cádiz."
  * Si el usuario pregunta explícitamente por el aeropuerto más cercano a su ubicación, devuelve esta tarjeta asignando el valor "NEAREST_AIRPORT" a la propiedad 'stopName' y el "content" DEBE SER: "✈️ ¡Perfecto! Voy a localizarte para mostrarte la ruta en coche hasta tu aeropuerto más cercano."
  * Si pregunta por una parada específica por su nombre, devuelve 'lat' y 'lon'.
- "NavigationCard": Para dar indicaciones GPS en vivo ("cómo llego", "llévame allí").
- "ContactCard": Cuando el usuario pida un taxi o quiera hacer una reserva. NO muestres el teléfono (956212121) en el texto del content. En el texto del content debes decir LITERALMENTE: "¡Claro! Para pedir un taxi ahora en Cádiz, debes ponerte en contacto directamente con la emisora oficial autorizada por el Ayuntamiento. Puedes llamarles por teléfono o pedir el taxi por whatsapp." IMPORTANTE: En el array "suggestedBlocks" de esta tarjeta DEBES devolver EXACTAMENTE estos 3 textos: "💶 Tarifas Oficiales", "🧮 Calculadora de taxi", "📍 Parada más cerca"
- "ReservationCard": Úsala cuando el usuario quiera hacer una reserva anticipada, preguntar por reservas o cuando haga clic en el bloque RESERVAS. (Esta tarjeta pintará un botón para enviar un email pre-rellenado).
`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                cardType: {
                    type: Type.STRING,
                    enum: ['TextCard', 'TariffCard', 'PriceCard', 'RuleCard', 'ContactCard', 'MapCard', 'NavigationCard', 'ReservationCard'],
                    description: "El tipo de tarjeta visual a mostrar."
                },
                content: {
                    type: Type.STRING,
                    description: "El mensaje principal del asistente. Usa emojis libremente y un tono directo y servicial. ¡NUNCA incluyas el número de teléfono literal en una ContactCard!"
                },
                priceEstimate: { type: Type.STRING, description: "Precio estimado con símbolo €. Solo para PriceCard." },
                routeDetails: { type: Type.STRING, description: "Resumen de ruta/cálculo. Solo para PriceCard." },
                lawSource: { type: Type.STRING, description: "Normativa exacta. Solo para RuleCard." },
                phoneNumber: { type: Type.STRING, description: "Número oficial. Solo para ContactCard." },
                stopName: { type: Type.STRING, description: "Nombre oficial de parada. Solo para MapCard/NavigationCard." },
                lat: { type: Type.STRING, description: "Latitud exacta. Solo para MapCard/NavigationCard." },
                lon: { type: Type.STRING, description: "Longitud exacta. Solo para MapCard/NavigationCard." },
                suggestedBlocks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: "1 a 3 bloques sugeridos para guiar al usuario hacia la conversión."
                }
            },
            required: ['cardType', 'content', 'suggestedBlocks']
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
            let configObj = {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
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
                                    estadoCielo: todayData.estadoCielo ? todayData.estadoCielo.descripcion : "N/A",
                                    viento: todayData.viento ? `${todayData.viento.velocidad} km/h (${todayData.viento.direccion})` : "N/A",
                                    oleaje: todayData.oleaje ? todayData.oleaje.descripcion : "N/A",
                                    temperaturaAgua: todayData.tAgua ? `${todayData.tAgua.valor}ºC` : "N/A",
                                    sensacionTermica: todayData.sTermica ? todayData.sTermica.descripcion : "N/A",
                                    uvMax: todayData.uvMax !== undefined ? todayData.uvMax : "N/A"
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

                    // Call generateContent again with the new history
                    response = await ai.models.generateContent({
                        model: currentModel,
                        contents: historyContents,
                        config: configObj
                    });
                }
            }
            
            responseText = response.text;
            
        } catch (error: any) {
            console.error("Error with model, fallback...", error);
            // Fallback sin herramientas por simplicidad si falla 2.5
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: historyContents,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.1
                }
            });
            responseText = fallbackResponse.text;
        }

        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        } catch(e) {
            // Si el modelo alucinó texto plano
            parsedData = { cardType: 'TextCard', content: responseText, suggestedBlocks: ['🚕 Ver tarifas'] };
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
